import * as Updates from 'expo-updates';
import { Alert, Platform, AppState } from 'react-native';

class UpdateService {
  private isChecking = false;
  private hasPendingUpdate = false;

  async checkForUpdates(showAlert: boolean = false) {
    if (Platform.OS === 'web' || __DEV__) {
      console.log('Updates not available in development or web');
      return;
    }

    if (this.isChecking) {
      console.log('Update check already in progress');
      return;
    }

    this.isChecking = true;

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('Update available, downloading silently...');

        // Download the update silently in the background
        await Updates.fetchUpdateAsync();
        this.hasPendingUpdate = true;
        console.log('Update downloaded. It will apply on next cold start.');

        if (showAlert) {
          Alert.alert(
            'Update Ready',
            'A new version of the app has been downloaded. Restart to apply the update?',
            [
              {
                text: 'Later',
                style: 'cancel',
              },
              {
                text: 'Restart Now',
                onPress: () => this.restartApp(),
              },
            ]
          );
        }
      } else {
        console.log('No updates available');
        if (showAlert) {
          Alert.alert('No Updates', 'You are running the latest version of the app.');
        }
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
      if (showAlert) {
        Alert.alert('Update Error', 'Failed to check for updates. Please try again later.');
      }
    } finally {
      this.isChecking = false;
    }
  }

  async downloadAndRestart() {
    try {
      console.log('Downloading update...');
      await Updates.fetchUpdateAsync();
      this.hasPendingUpdate = true;

      console.log('Update downloaded, restarting...');
      await this.restartApp();
    } catch (error) {
      console.log('Error downloading update:', error);
      Alert.alert('Update Error', 'Failed to download update. Please try again later.');
    }
  }

  async restartApp() {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.log('Error restarting app:', error);
    }
  }

  async forceCheckForUpdates() {
    await this.checkForUpdates(true);
  }

  getUpdateInfo() {
    return {
      updateId: Updates.updateId,
      createdAt: Updates.createdAt,
      runtimeVersion: Updates.runtimeVersion,
      channel: Updates.channel,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      isEmergencyLaunch: Updates.isEmergencyLaunch,
    };
  }

  /**
   * Initialize silent updates that run in the background
   * without interrupting the user experience
   */
  initializeSilentUpdates() {
    if (Platform.OS === 'web' || __DEV__) {
      console.log('Silent updates not available in development or web');
      return;
    }

    // Check for updates on initialization
    this.checkForUpdates(false);

    // Listen for app state changes to check for updates when app becomes active
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Check for updates when the app becomes active again
        setTimeout(() => {
          this.checkForUpdates(false);
        }, 5000); // Delay slightly to ensure app is fully loaded
      }
    });

    return subscription;
  }

  /**
   * Check if there's a pending update that will apply on next restart
   */
  hasUpdatePending(): boolean {
    return this.hasPendingUpdate;
  }
}

export default new UpdateService();