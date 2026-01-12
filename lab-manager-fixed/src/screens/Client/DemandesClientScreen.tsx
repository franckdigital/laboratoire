import { demandeAnalyseAPI, devisAPI, proformaAPI } from '@/src/services/api';
import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

export function DemandesClientScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [proformas, setProformas] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);

  const normalizeId = (value: any) => {
    if (value == null) return '';
    if (typeof value === 'object') return value.id != null ? String(value.id) : '';
    return String(value);
  };

  const getProformaForDemande = (demandeId: any) => {
    const id = normalizeId(demandeId);
    return proformas.find((p) => normalizeId(p.demande_devis) === id);
  };

  const getAnalyseForDemande = (demandeId: any) => {
    const id = normalizeId(demandeId);
    return analyses.find((a) => normalizeId(a.demande_devis) === id);
  };

  const getWorkflow = (demande: any) => {
    const proforma = getProformaForDemande(demande.id);
    const analyse = getAnalyseForDemande(demande.id);

    if (analyse) {
      const s = analyse.statut;
      const isDone = s === 'TERMINEE' || s === 'RESULTATS_ENVOYES';
      const isRunning = s === 'EN_COURS' || s === 'ECHANTILLONS_RECUS';
      const isWaiting = s === 'EN_ATTENTE_ECHANTILLONS';
      return {
        proforma,
        analyse,
        badge: isDone ? 'Terminée' : isRunning ? 'En cours' : 'En attente',
        badgeKey: isDone ? 'ACCEPTEE' : isRunning ? 'EN_COURS' : 'EN_ATTENTE',
        progress: isDone ? 100 : isRunning ? 60 : isWaiting ? 40 : 40,
        canDecide: false,
      };
    }

    if (proforma) {
      if (proforma.statut === 'VALIDEE') {
        return { proforma, analyse: null, badge: 'À valider', badgeKey: 'EN_COURS', progress: 25, canDecide: true };
      }
      if (proforma.statut === 'ACCEPTEE') {
        return { proforma, analyse: null, badge: 'Acceptée', badgeKey: 'ACCEPTEE', progress: 50, canDecide: false };
      }
      if (proforma.statut === 'REFUSEE') {
        return { proforma, analyse: null, badge: 'Refusée', badgeKey: 'REFUSEE', progress: 0, canDecide: false };
      }
      return { proforma, analyse: null, badge: 'En attente', badgeKey: 'EN_ATTENTE', progress: 10, canDecide: false };
    }

    const statut = demande?.statut;
    if (statut === 'EN_COURS') return { proforma: null, analyse: null, badge: 'En cours', badgeKey: 'EN_COURS', progress: 50, canDecide: false };
    if (statut === 'ACCEPTEE') return { proforma: null, analyse: null, badge: 'Acceptée', badgeKey: 'ACCEPTEE', progress: 100, canDecide: false };
    if (statut === 'REFUSEE') return { proforma: null, analyse: null, badge: 'Refusée', badgeKey: 'REFUSEE', progress: 0, canDecide: false };
    return { proforma: null, analyse: null, badge: 'En attente', badgeKey: 'EN_ATTENTE', progress: 0, canDecide: false };
  };

  const chipStyle = (key: string) => {
    switch (key) {
      case 'ACCEPTEE':
        return { backgroundColor: '#DCFCE7' };
      case 'EN_COURS':
        return { backgroundColor: '#DBEAFE' };
      case 'REFUSEE':
        return { backgroundColor: '#FFE4E6' };
      default:
        return { backgroundColor: '#F1F5F9' };
    }
  };

  const load = async () => {
    try {
      const [d, p, a] = await Promise.all([devisAPI.mesDemandes(), proformaAPI.list(), demandeAnalyseAPI.list()]);
      const dList = d?.results || d || [];
      const pList = p?.results || p || [];
      const aList = a?.results || a || [];
      setDemandes(dList);
      setProformas(pList);
      setAnalyses(aList);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Demandes client load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const stats = useMemo(() => {
    const wf = demandes.map((d) => getWorkflow(d));
    return {
      total: demandes.length,
      en_cours: wf.filter((x) => x.badgeKey === 'EN_COURS').length,
      terminees: wf.filter((x) => x.badge === 'Terminée').length,
    };
  }, [demandes, proformas, analyses]);

  const accepter = async (proformaId: any) => {
    try {
      await proformaAPI.accepter(String(proformaId));
      await load();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erreur accepter proforma:', e);
    }
  };

  const refuser = async (proformaId: any) => {
    try {
      await proformaAPI.refuser(String(proformaId));
      await load();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erreur refuser proforma:', e);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mes demandes
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {loading ? 'Chargement...' : `${stats.total} demande(s)`}
        </Text>
      </View>

      <View style={styles.kpis}>
        <Card style={styles.kpiCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.total}</Text>
            <Text variant="bodySmall">Total</Text>
          </Card.Content>
        </Card>
        <Card style={styles.kpiCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.en_cours}</Text>
            <Text variant="bodySmall">En cours</Text>
          </Card.Content>
        </Card>
        <Card style={styles.kpiCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.terminees}</Text>
            <Text variant="bodySmall">Terminées</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.list}>
        {demandes.map((demande) => {
          const wf = getWorkflow(demande);
          return (
            <Card key={String(demande.id)} style={styles.item}>
              <Card.Title
                title={demande.numero || 'Demande'}
                subtitle={`${demande.type_analyse || ''}${demande.categorie ? ' - ' + demande.categorie : ''}`}
                right={() => (
                  <Chip style={[styles.chip, chipStyle(wf.badgeKey)]}>
                    {wf.badge}
                  </Chip>
                )}
              />
              <Card.Content>
                <Text variant="bodySmall">Avancement: {wf.progress}%</Text>
              </Card.Content>
              {wf.proforma?.statut === 'VALIDEE' ? (
                <Card.Actions>
                  <Button mode="contained" onPress={() => accepter(wf.proforma.id)}>
                    Accepter
                  </Button>
                  <Button mode="outlined" onPress={() => refuser(wf.proforma.id)}>
                    Refuser
                  </Button>
                </Card.Actions>
              ) : null}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontWeight: 'bold', color: '#1F2937' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  kpis: { flexDirection: 'row', gap: 12, padding: 12 },
  kpiCard: { flex: 1 },
  list: { padding: 12, gap: 12 },
  item: { elevation: 1 },
  chip: { alignSelf: 'flex-end' },
});
