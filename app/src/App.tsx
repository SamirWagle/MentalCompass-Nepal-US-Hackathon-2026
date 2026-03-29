import React from 'react';
import { useApp } from '@hooks/useApp';
import { Layout } from '@components/common/Layout';
import { DashboardScreen } from '@screens/DashboardScreen';
import { CopilotScreen } from '@screens/CopilotScreen';
import { CheckinScreen } from '@screens/CheckinScreen';
import { InsightsScreen } from '@screens/InsightsScreen';
import { SignalsScreen } from '@screens/SignalsScreen';
import { PrivacyScreen } from '@screens/PrivacyScreen';
import { ClinicianScreen } from '@screens/ClinicianScreen';
import { MilestonesScreen } from '@screens/MilestonesScreen';
import { VaultScreen } from '@screens/VaultScreen';
import { CommunityScreen } from '@screens/CommunityScreen';
import { JournalScreen } from '@screens/JournalScreen';
import { BookingScreen } from '@screens/BookingScreen';
import { TriageScreen } from '@screens/TriageScreen';
import { AlertsScreen } from '@screens/AlertsScreen';
import { ComplianceScreen } from '@screens/ComplianceScreen';
import { WipeLogScreen } from '@screens/WipeLogScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { AdminScreen } from '@screens/AdminScreen';
import { LegacyScreen } from '@screens/LegacyScreen';
import { CareerScreen } from '@screens/CareerScreen';
import { SupportScreen } from '@screens/SupportScreen';
import { VoiceLabScreen } from '@screens/VoiceLabScreen';
import { ScreeningScreen } from '@screens/ScreeningScreen';
import './App.css';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'copilot':
        return <CopilotScreen />;
      case 'checkin':
        return <CheckinScreen />;
      case 'career':
        return <CareerScreen />;
      case 'support':
        return <SupportScreen />;
      case 'voice':
        return <VoiceLabScreen />;
      case 'screening':
        return <ScreeningScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'signals':
        return <SignalsScreen />;
      case 'privacy':
        return <PrivacyScreen />;
      case 'clinician':
        return <ClinicianScreen />;
      case 'milestones':
        return <MilestonesScreen />;
      case 'vault':
        return <VaultScreen />;
      case 'community':
        return <CommunityScreen />;
      case 'journal':
        return <JournalScreen />;
      case 'booking':
        return <BookingScreen />;
      case 'triage':
        return <TriageScreen />;
      case 'alerts':
        return <AlertsScreen />;
      case 'compliance':
        return <ComplianceScreen />;
      case 'wipelog':
        return <WipeLogScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'admin':
        return <AdminScreen />;
      case 'legacy':
        return <LegacyScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <Layout>
      <div className="screen-container">
        {renderScreen()}
      </div>
    </Layout>
  );
}

export default AppContent;
