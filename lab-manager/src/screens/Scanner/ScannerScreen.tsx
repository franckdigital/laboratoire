import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Chip, Portal, Modal, IconButton } from 'react-native-paper';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { stockAPI } from '../../services/api';

export function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!permission) {
    return <View style={styles.container}><Text>Chargement...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text variant="headlineSmall" style={styles.permissionTitle}>
            Permission caméra requise
          </Text>
          <Text variant="bodyMedium" style={styles.permissionText}>
            L'application a besoin d'accéder à la caméra pour scanner les QR codes.
          </Text>
          <Button mode="contained" onPress={requestPermission} style={styles.permissionButton}>
            Autoriser l'accès
          </Button>
        </View>
      </View>
    );
  }

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanning) return;

    setScanning(true);
    try {
      // Déterminer le type de code scanné
      if (data.startsWith('ARTICLE:')) {
        const response = await stockAPI.scanArticle(data);
        setScannedData({ type: 'article', data: response });
      } else if (data.startsWith('LOT:')) {
        const response = await stockAPI.scanLot(data);
        setScannedData({ type: 'lot', data: response });
      } else if (data.startsWith('EMPLACEMENT:')) {
        const response = await stockAPI.scanEmplacement(data);
        setScannedData({ type: 'emplacement', data: response });
      } else {
        Alert.alert('QR Code non reconnu', 'Le code scanné n\'est pas un code valide.');
      }

      setModalVisible(true);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors du scan');
    } finally {
      // Attendre 2 secondes avant de pouvoir scanner à nouveau
      setTimeout(() => setScanning(false), 2000);
    }
  }

  function closeModal() {
    setModalVisible(false);
    setScannedData(null);
  }

  function renderScannedContent() {
    if (!scannedData) return null;

    const { type, data } = scannedData;

    switch (type) {
      case 'article':
        return (
          <View>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Article scanné
            </Text>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Référence:</Text>
              <Text variant="bodyMedium">{data.reference_interne}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Désignation:</Text>
              <Text variant="bodyMedium">{data.designation}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Stock:</Text>
              <Text variant="bodyMedium">{data.quantite_stock} {data.unite_mesure}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Seuil alerte:</Text>
              <Text variant="bodyMedium">{data.seuil_alerte} {data.unite_mesure}</Text>
            </View>
            {data.est_critique && (
              <Chip icon="alert" mode="outlined" style={styles.criticalChip}>
                Stock critique
              </Chip>
            )}
          </View>
        );

      case 'lot':
        return (
          <View>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Lot scanné
            </Text>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">N° Lot:</Text>
              <Text variant="bodyMedium">{data.numero_lot}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Article:</Text>
              <Text variant="bodyMedium">{data.article.designation}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Quantité restante:</Text>
              <Text variant="bodyMedium">{data.quantite_restante} {data.unite}</Text>
            </View>
            {data.date_peremption && (
              <View style={styles.infoRow}>
                <Text variant="labelMedium">Date péremption:</Text>
                <Text variant="bodyMedium">
                  {new Date(data.date_peremption).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            )}
            <Chip
              icon="information"
              mode="outlined"
              style={[
                styles.statusChip,
                data.statut === 'EXPIRE' && styles.expiredChip,
              ]}
            >
              {data.statut}
            </Chip>
          </View>
        );

      case 'emplacement':
        return (
          <View>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Emplacement scanné
            </Text>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Code:</Text>
              <Text variant="bodyMedium">{data.code}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="labelMedium">Entrepôt:</Text>
              <Text variant="bodyMedium">{data.entrepot.nom}</Text>
            </View>
            {data.allee && (
              <View style={styles.infoRow}>
                <Text variant="labelMedium">Allée:</Text>
                <Text variant="bodyMedium">{data.allee}</Text>
              </View>
            )}
            {data.rayon && (
              <View style={styles.infoRow}>
                <Text variant="labelMedium">Rayon:</Text>
                <Text variant="bodyMedium">{data.rayon}</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Scanner QR Code
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Placez le QR code dans le cadre
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanning ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
        </CameraView>
      </View>

      <View style={styles.instructions}>
        <Text variant="bodyMedium" style={styles.instructionText}>
          ✓ Scanner un article
        </Text>
        <Text variant="bodyMedium" style={styles.instructionText}>
          ✓ Scanner un lot
        </Text>
        <Text variant="bodyMedium" style={styles.instructionText}>
          ✓ Scanner un emplacement
        </Text>
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <IconButton
                icon="close"
                size={24}
                onPress={closeModal}
                style={styles.closeButton}
              />
              {renderScannedContent()}
            </Card.Content>
            <Card.Actions>
              <Button onPress={closeModal}>Fermer</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#00FF00',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructions: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  instructionText: {
    color: '#6B7280',
    marginVertical: 4,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 12,
  },
  modalContainer: {
    margin: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusChip: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  criticalChip: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderColor: '#DC2626',
  },
  expiredChip: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
});
