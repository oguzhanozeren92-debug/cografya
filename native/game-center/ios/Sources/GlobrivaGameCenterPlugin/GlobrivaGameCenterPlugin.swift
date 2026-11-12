import Foundation
import Capacitor
import GameKit

/// Apple Game Center for Globriva: silent sign-in, score submission,
/// achievements and opening the native leaderboard screen.
/// Every method resolves instead of throwing when Game Center is unavailable,
/// so the game never breaks for players who are not signed in.
@objc(GlobrivaGameCenterPlugin)
public class GlobrivaGameCenterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GlobrivaGameCenterPlugin"
    public let jsName = "GlobrivaGameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isSignedIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reportAchievement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboards", returnType: CAPPluginReturnPromise)
    ]

    private var authStarted = false
    private var pendingSignIn: [CAPPluginCall] = []

    @objc func signIn(_ call: CAPPluginCall) {
        if GKLocalPlayer.local.isAuthenticated {
            call.resolve(["signedIn": true])
            return
        }
        pendingSignIn.append(call)
        if authStarted { return }
        authStarted = true
        DispatchQueue.main.async {
            GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, _ in
                guard let self = self else { return }
                if let viewController = viewController {
                    // Apple's own sign-in sheet; shown once, the player may close it.
                    self.bridge?.viewController?.present(viewController, animated: true)
                    return
                }
                let signedIn = GKLocalPlayer.local.isAuthenticated
                let waiting = self.pendingSignIn
                self.pendingSignIn = []
                waiting.forEach { $0.resolve(["signedIn": signedIn]) }
            }
        }
    }

    @objc func isSignedIn(_ call: CAPPluginCall) {
        call.resolve(["signedIn": GKLocalPlayer.local.isAuthenticated])
    }

    @objc func submitScore(_ call: CAPPluginCall) {
        guard let leaderboardId = call.getString("leaderboardId"), !leaderboardId.isEmpty,
              let score = call.getInt("score"), score >= 0 else {
            call.reject("leaderboardId and a non-negative score are required")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.resolve(["submitted": false])
            return
        }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local,
                                  leaderboardIDs: [leaderboardId]) { error in
            call.resolve(["submitted": error == nil])
        }
    }

    @objc func reportAchievement(_ call: CAPPluginCall) {
        guard let achievementId = call.getString("achievementId"), !achievementId.isEmpty else {
            call.reject("achievementId is required")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.resolve(["reported": false])
            return
        }
        let achievement = GKAchievement(identifier: achievementId)
        achievement.percentComplete = min(100, max(0, call.getDouble("percent") ?? 100))
        achievement.showsCompletionBanner = true
        GKAchievement.report([achievement]) { error in
            call.resolve(["reported": error == nil])
        }
    }

    @objc func showLeaderboards(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.resolve(["shown": false])
            return
        }
        DispatchQueue.main.async {
            GKAccessPoint.shared.trigger(state: .leaderboards) {}
            call.resolve(["shown": true])
        }
    }
}
