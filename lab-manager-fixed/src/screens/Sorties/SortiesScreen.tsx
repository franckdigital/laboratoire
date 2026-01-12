import { stockAPI } from '@/src/services/api';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, FAB, Modal, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';

interface Sortie {
  id: number;
  numero_sortie: string;
  lot_numero: string;
  article_nom: string;
  article_reference: string;
  quantite: number;
  unite: string;
  type_sortie: string;
  type_sortie_display: string;
  motif: string;
  utilisateur_nom: string;
  date_sortie: string;
  valide: boolean;
  valide_par_nom: string | null;
}

interface Lot {
  id: number;
  numero_lot: string;
  quantite_restante: number;
  unite: string;
  article: {
    id: number;
    designation: string;
    reference_interne: string;
  };
}

const TYPE_SORTIE_OPTIONS = [
  { value: 'CONSOMMATION', label: 'Consommation laboratoire' },
  { value: 'ANALYSE', label: 'Utilisation pour analyse' },
  { value: 'PERTE', label: 'Perte/Casse' },
  { value: 'PEREMPTION', label: 'Péremption' },
  { value: 'RETOUR_FOURNISSEUR', label: 'Retour fournisseur' },
  { value: 'DESTRUCTION', label: 'Destruction' },
  { value: 'AUTRE', label: 'Autre' },
];

export function SortiesScreen() {
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('all');

  // Form state
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [quantite, setQuantite] = useState('');
  const [typeSortie, setTypeSortie] = useState('CONSOMMATION');
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sortiesData, lotsData] = await Promise.all([
        stockAPI.listSorties(),
        stockAPI.listLots(),
      ]);
      setSorties(sortiesData.results || sortiesData);
      setLots((lotsData.results || lotsData).filter((l: Lot) => l.quantite_restante > 0));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadData();
  }

  function getStatusColor(valide: boolean) {
    return valide ? '#10B981' : '#F59E0B';
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'CONSOMMATION':
      case 'ANALYSE':
        return '#3B82F6';
      case 'PERTE':
      case 'DESTRUCTION':
        return '#DC2626';
      case 'PEREMPTION':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  }

  function getFilteredSorties() {
    switch (filter) {
      case 'pending':
        return sorties.filter(s => !s.valide);
      case 'validated':
        return sorties.filter(s => s.valide);
      default:
        return sorties;
    }
  }

  async function handleCreateSortie() {
    if (!selectedLot || !quantite || parseFloat(quantite) <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      await stockAPI.createSortie({
        lot: selectedLot,
        quantite: parseFloat(quantite),
        type_sortie: typeSortie,
        motif: motif,
      });
      setModalVisible(false);
      resetForm();
      loadData();
      Alert.alert('Succès', 'Sortie de stock créée avec succès');
    } catch (error: any) {
      const message = error.response?.data?.quantite || error.response?.data?.detail || 'Erreur lors de la création';
      Alert.alert('Erreur', message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleValider(sortieId: number) {
    try {
      await stockAPI.validerSortie(sortieId.toString());
      loadData();
      Alert.alert('Succès', 'Sortie validée');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de valider la sortie');
    }
  }

  async function handleAnnuler(sortieId: number) {
    Alert.alert(
      'Confirmer l\'annulation',
      'Cette action remettra le stock. Continuer?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await stockAPI.annulerSortie(sortieId.toString());
              loadData();
              Alert.alert('Succès', 'Sortie annulée et stock remis');
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.detail || 'Impossible d\'annuler la sortie');
            }
          },
        },
      ]
    );
  }

  function resetForm() {
    setSelectedLot(null);
    setQuantite('');
    setTypeSortie('CONSOMMATION');
    setMotif('');
  }

  const selectedLotData = lots.find(l => l.id === selectedLot);
  const filteredSorties = getFilteredSorties();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Sorties de Stock
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Gestion des sorties et consommations
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as any)}
          buttons={[
            { value: 'all', label: 'Toutes' },
            { value: 'pending', label: 'En attente' },
            { value: 'validated', label: 'Validées' },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredSorties.map((sortie) => (
          <Card key={sortie.id} style={styles.card}>
            <Card.Title
              title={sortie.numero_sortie}
              subtitle={sortie.article_nom}
              left={(props) => (
                <View style={[styles.iconContainer, { backgroundColor: getTypeColor(sortie.type_sortie) }]}>
                  <Text style={styles.iconText}>S</Text>
                </View>
              )}
              right={() => (
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(sortie.valide) }]}
                  textStyle={styles.statusChipText}
                >
                  {sortie.valide ? 'Validée' : 'En attente'}
                </Chip>
              )}
            />
            <Card.Content>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.label}>Lot</Text>
                  <Text variant="bodyMedium">{sortie.lot_numero}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.label}>Quantité</Text>
                  <Text variant="bodyMedium" style={styles.quantite}>
                    -{sortie.quantite} {sortie.unite}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.label}>Type</Text>
                  <Text variant="bodyMedium">{sortie.type_sortie_display}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.label}>Date</Text>
                  <Text variant="bodyMedium">
                    {new Date(sortie.date_sortie).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
              {sortie.motif ? (
                <View style={styles.motifContainer}>
                  <Text variant="bodySmall" style={styles.label}>Motif:</Text>
                  <Text variant="bodySmall">{sortie.motif}</Text>
                </View>
              ) : null}
              <Text variant="bodySmall" style={styles.userInfo}>
                Par: {sortie.utilisateur_nom}
                {sortie.valide_par_nom && ` • Validé par: ${sortie.valide_par_nom}`}
              </Text>
            </Card.Content>
            {!sortie.valide && (
              <Card.Actions>
                <Button onPress={() => handleAnnuler(sortie.id)} textColor="#DC2626">
                  Annuler
                </Button>
                <Button onPress={() => handleValider(sortie.id)} mode="contained">
                  Valider
                </Button>
              </Card.Actions>
            )}
          </Card>
        ))}

        {filteredSorties.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucune sortie de stock trouvée
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Nouvelle Sortie de Stock
            </Text>

            <Text variant="bodySmall" style={styles.fieldLabel}>Lot *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLot}
                onValueChange={(value) => setSelectedLot(value)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner un lot..." value={null} />
                {lots.map((lot) => (
                  <Picker.Item
                    key={lot.id}
                    label={`${lot.numero_lot} - ${lot.article.designation} (${lot.quantite_restante} ${lot.unite})`}
                    value={lot.id}
                  />
                ))}
              </Picker>
            </View>

            {selectedLotData && (
              <View style={styles.lotInfo}>
                <Text variant="bodySmall">
                  Stock disponible: {selectedLotData.quantite_restante} {selectedLotData.unite}
                </Text>
              </View>
            )}

            <TextInput
              label="Quantité *"
              value={quantite}
              onChangeText={setQuantite}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />

            <Text variant="bodySmall" style={styles.fieldLabel}>Type de sortie *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={typeSortie}
                onValueChange={(value) => setTypeSortie(value)}
                style={styles.picker}
              >
                {TYPE_SORTIE_OPTIONS.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>

            <TextInput
              label="Motif / Commentaire"
              value={motif}
              onChangeText={setMotif}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button onPress={() => setModalVisible(false)} style={styles.modalButton}>
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateSortie}
                loading={submitting}
                disabled={submitting}
                style={styles.modalButton}
              >
                Créer la sortie
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
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
  filterContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusChip: {
    marginRight: 12,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  infoItem: {
    width: '45%',
  },
  label: {
    color: '#6B7280',
    marginBottom: 2,
  },
  quantite: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  motifContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  userInfo: {
    color: '#9CA3AF',
    marginTop: 8,
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
  modal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  fieldLabel: {
    color: '#6B7280',
    marginBottom: 4,
    marginTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  lotInfo: {
    backgroundColor: '#E0F2FE',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    minWidth: 100,
  },
});
