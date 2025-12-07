import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Avatar, Chip, Divider } from 'react-native-paper';
import { dashboardAPI, stockAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [statsData, alertesData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getAlertesCritiques(),
      ]);
      setStats(statsData);
      setAlertes(alertesData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboardData();
  }

  function getAlertIcon(type: string) {
    switch (type) {
      case 'STOCK_CRITIQUE':
      case 'RUPTURE':
        return 'alert-circle';
      case 'PEREMPTION_60J':
      case 'PEREMPTION_30J':
      case 'PEREMPTION_7J':
        return 'clock-alert';
      case 'EXPIRE':
        return 'alert-octagon';
      case 'QUARANTAINE':
        return 'shield-alert';
      default:
        return 'information';
    }
  }

  function getAlertColor(niveau: string) {
    switch (niveau) {
      case 'CRITIQUE':
      case 'URGENT':
        return '#DC2626';
      case 'AVERTISSEMENT':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Tableau de bord
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Bonjour, {user?.first_name} {user?.last_name}
        </Text>
      </View>

      {/* Statistiques */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Avatar.Icon size={48} icon="package-variant" style={styles.statIcon} />
            <Text variant="headlineSmall" style={styles.statValue}>
              {stats?.total_articles || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Articles
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Avatar.Icon size={48} icon="alert-circle" style={[styles.statIcon, { backgroundColor: '#F59E0B' }]} />
            <Text variant="headlineSmall" style={styles.statValue}>
              {stats?.alertes_actives || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Alertes actives
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Avatar.Icon size={48} icon="alert-octagon" style={[styles.statIcon, { backgroundColor: '#DC2626' }]} />
            <Text variant="headlineSmall" style={styles.statValue}>
              {stats?.produits_expires || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Produits expirés
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Avatar.Icon size={48} icon="package-down" style={[styles.statIcon, { backgroundColor: '#6B7280' }]} />
            <Text variant="headlineSmall" style={styles.statValue}>
              {stats?.stock_critique || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Stock critique
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Alertes critiques */}
      <Card style={styles.alertesCard}>
        <Card.Title
          title="Alertes critiques"
          subtitle={`${alertes.length} alerte(s) nécessitant une attention`}
          left={(props) => <Avatar.Icon {...props} icon="bell-alert" />}
        />
        <Card.Content>
          {alertes.length === 0 ? (
            <Text variant="bodyMedium" style={styles.noAlertesText}>
              Aucune alerte critique
            </Text>
          ) : (
            alertes.slice(0, 5).map((alerte, index) => (
              <View key={alerte.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.alerteItem}>
                  <Avatar.Icon
                    size={40}
                    icon={getAlertIcon(alerte.type_alerte)}
                    style={{ backgroundColor: getAlertColor(alerte.niveau_priorite) }}
                  />
                  <View style={styles.alerteContent}>
                    <Text variant="titleSmall">{alerte.titre}</Text>
                    <Text variant="bodySmall" numberOfLines={2}>
                      {alerte.message}
                    </Text>
                    <Chip
                      mode="outlined"
                      style={styles.chip}
                      textStyle={{ fontSize: 11 }}
                    >
                      {alerte.niveau_priorite}
                    </Chip>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
    backgroundColor: '#006bb3',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    color: '#6B7280',
    marginTop: 4,
  },
  alertesCard: {
    margin: 12,
    elevation: 2,
  },
  noAlertesText: {
    textAlign: 'center',
    color: '#9CA3AF',
    paddingVertical: 16,
  },
  alerteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  alerteContent: {
    flex: 1,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    height: 24,
  },
  divider: {
    marginVertical: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
  },
});
