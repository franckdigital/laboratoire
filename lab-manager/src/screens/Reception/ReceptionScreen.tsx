import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, FAB, Chip, Avatar } from 'react-native-paper';
import { stockAPI } from '../../services/api';

export function ReceptionScreen() {
  const [receptions, setReceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReceptions();
  }, []);

  async function loadReceptions() {
    try {
      const data = await stockAPI.listReceptions();
      setReceptions(data.results || data);
    } catch (error) {
      console.error('Error loading receptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadReceptions();
  }

  function getStatusColor(statut: string) {
    switch (statut) {
      case 'EN_COURS':
        return '#F59E0B';
      case 'VERIFIEE':
        return '#3B82F6';
      case 'VALIDEE':
        return '#10B981';
      case 'REJETEE':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Réceptions
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Gestion des réceptions de stock
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {receptions.map((reception) => (
          <Card key={reception.id} style={styles.card}>
            <Card.Title
              title={reception.numero_reception}
              subtitle={reception.fournisseur.raison_sociale}
              left={(props) => <Avatar.Icon {...props} icon="package-variant" />}
            />
            <Card.Content>
              <View style={styles.infoRow}>
                <Text variant="bodySmall">Date:</Text>
                <Text variant="bodySmall">
                  {new Date(reception.date_reception).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              {reception.numero_bl && (
                <View style={styles.infoRow}>
                  <Text variant="bodySmall">N° BL:</Text>
                  <Text variant="bodySmall">{reception.numero_bl}</Text>
                </View>
              )}
              <Chip
                mode="outlined"
                icon={reception.conforme ? 'check-circle' : 'alert-circle'}
                style={[
                  styles.chip,
                  { borderColor: getStatusColor(reception.statut) },
                ]}
              >
                {reception.statut}
              </Chip>
            </Card.Content>
          </Card>
        ))}

        {receptions.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucune réception trouvée
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to create reception
        }}
      />
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#006bb3',
  },
});
