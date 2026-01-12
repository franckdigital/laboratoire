import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, Avatar, IconButton } from 'react-native-paper';
import { stockAPI } from '@/src/services/api';

export function AlertesScreen() {
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlertes();
  }, []);

  async function loadAlertes() {
    try {
      const data = await stockAPI.listAlertes({ statut: 'ACTIVE' });
      setAlertes(data.results || data);
    } catch (error) {
      console.error('Error loading alertes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadAlertes();
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Alertes
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {alertes.length} alerte(s) active(s)
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {alertes.map((alerte) => (
          <Card key={alerte.id} style={styles.card}>
            <Card.Title
              title={alerte.titre}
              subtitle={alerte.type_alerte}
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon={getAlertIcon(alerte.type_alerte)}
                  style={{ backgroundColor: getAlertColor(alerte.niveau_priorite) }}
                />
              )}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="check"
                  onPress={() => {
                    // TODO: Marquer comme traitée
                  }}
                />
              )}
            />
            <Card.Content>
              <Text variant="bodyMedium" style={styles.message}>
                {alerte.message}
              </Text>
              <View style={styles.footer}>
                <Chip
                  mode="outlined"
                  style={[styles.chip, { borderColor: getAlertColor(alerte.niveau_priorite) }]}
                  textStyle={{ fontSize: 11 }}
                >
                  {alerte.niveau_priorite}
                </Chip>
                <Text variant="bodySmall" style={styles.date}>
                  {new Date(alerte.date_creation).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        {alertes.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucune alerte active
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    padding: 12,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  message: {
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  chip: {
    height: 24,
  },
  date: {
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#9CA3AF',
  },
});
