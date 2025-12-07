import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, FAB, Chip } from 'react-native-paper';
import { stockAPI } from '../../services/api';

export function InventaireScreen() {
  const [inventaires, setInventaires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInventaires();
  }, []);

  async function loadInventaires() {
    try {
      const data = await stockAPI.listInventaires();
      setInventaires(data.results || data);
    } catch (error) {
      console.error('Error loading inventaires:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadInventaires();
  }

  function getStatusColor(statut: string) {
    switch (statut) {
      case 'EN_COURS':
        return '#F59E0B';
      case 'TERMINE':
        return '#10B981';
      case 'VALIDE':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Inventaires
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Gestion des inventaires de stock
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {inventaires.map((inventaire) => (
          <Card key={inventaire.id} style={styles.card}>
            <Card.Title
              title={`Inventaire ${inventaire.type_inventaire}`}
              subtitle={new Date(inventaire.date_debut).toLocaleDateString('fr-FR')}
              left={(props) => <Card.Icon {...props} icon="clipboard-list" />}
            />
            <Card.Content>
              <View style={styles.infoRow}>
                <Text variant="bodySmall">Responsable:</Text>
                <Text variant="bodySmall">
                  {inventaire.responsable?.first_name} {inventaire.responsable?.last_name}
                </Text>
              </View>
              <Chip
                mode="outlined"
                style={[styles.chip, { borderColor: getStatusColor(inventaire.statut) }]}
              >
                {inventaire.statut}
              </Chip>
            </Card.Content>
          </Card>
        ))}

        {inventaires.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucun inventaire trouvé
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to create inventaire
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
