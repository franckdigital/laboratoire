# WORKFLOW PROFORMA ET ANALYSES - RECOMMANDATIONS

## 🎯 PROCESSUS RECOMMANDÉ

### PHASE 1: DEMANDE DE DEVIS (PRE-ENGAGEMENT)

**Étapes:**
1. **Client soumet formulaire de demande**
   - Type d'analyse
   - Catégorie
   - Nombre d'échantillons
   - Priorité
   
2. **Système génère Proforma automatique**
   - Statut: `BROUILLON`
   - Calcul automatique selon grille tarifaire
   - Client peut télécharger immédiatement
   - **Message:** "Ceci est un devis estimatif. Le prix final peut être ajusté après révision."

3. **Admin révise la demande** (optionnel mais recommandé)
   - Vérifie la demande
   - Peut ajuster les prix si nécessaire
   - Change statut: `BROUILLON` → `VALIDEE`
   - Email automatique au client

4. **Client décide**
   - **Accepte** → Passe à PHASE 2 (Demande d'Analyse)
   - **Refuse** → Proforma archivée

---

### PHASE 2: DEMANDE D'ANALYSE (ENGAGEMENT)

**Étapes:**
5. **Client accepte le devis**
   - Clic sur "Accepter ce devis"
   - Création automatique d'une `DemandeAnalyse`
   - Référence la Proforma acceptée

6. **Client dépose échantillons**
   - Vient au laboratoire physiquement
   - Admin réceptionne et confirme
   - Statut: `ECHANTILLONS_RECUS`

7. **Laboratoire effectue analyses**
   - Statut: `EN_COURS`
   - Techniciens saisissent résultats

8. **Résultats prêts**
   - Statut: `TERMINEE`
   - Facture finale générée
   - Email au client

9. **Client paye et télécharge**
   - Paiement enregistré
   - Téléchargement des résultats PDF

---

## 📊 MODÈLES DE DONNÉES PROPOSÉS

### DemandeDevis (Estimation)
```python
class DemandeDevis(models.Model):
    # Existant
    client = models.ForeignKey(User)
    type_analyse = models.CharField(...)
    categorie = models.CharField(...)
    echantillons = models.ManyToMany(EchantillonDevis)
    
    # Nouveau
    statut = models.CharField(choices=[
        ('EN_ATTENTE', 'En attente de révision'),
        ('EN_REVISION', 'En cours de révision'),
        ('VALIDEE', 'Validée par admin'),
        ('ACCEPTEE', 'Acceptée par client'),
        ('REFUSEE', 'Refusée par client'),
        ('EXPIREE', 'Expirée'),
    ])
    
    # Relations
    proforma → Proforma (OneToOne)
    demande_analyse → DemandeAnalyse (OneToOne, null=True)
```

### DemandeAnalyse (Commande réelle)
```python
class DemandeAnalyse(models.Model):
    """
    Créée UNIQUEMENT quand le client accepte le devis
    """
    numero = models.CharField()  # DAN-20251129-0001
    demande_devis = models.OneToOneField(DemandeDevis)
    proforma_acceptee = models.ForeignKey(Proforma)
    
    statut = models.CharField(choices=[
        ('EN_ATTENTE_ECHANTILLONS', 'En attente des échantillons'),
        ('ECHANTILLONS_RECUS', 'Échantillons reçus'),
        ('EN_COURS', 'Analyse en cours'),
        ('TERMINEE', 'Analyse terminée'),
        ('RESULTATS_ENVOYES', 'Résultats envoyés'),
    ])
    
    # Dates importantes
    date_depot_echantillons = models.DateTimeField(null=True)
    date_debut_analyse = models.DateTimeField(null=True)
    date_fin_analyse = models.DateTimeField(null=True)
    
    # Résultats
    resultats_pdf = models.FileField(upload_to='resultats/')
    
    # Facturation
    facture_finale → Facture (OneToOne)
```

### Proforma (Facture estimative)
```python
class Proforma(models.Model):
    # Existant
    demande_devis = models.OneToOneField(DemandeDevis)
    montant_ht = models.DecimalField()
    montant_tva = models.DecimalField()
    montant_ttc = models.DecimalField()
    
    # Nouveau
    statut = models.CharField(choices=[
        ('BROUILLON', 'Brouillon (non validée)'),
        ('VALIDEE', 'Validée par admin'),
        ('ACCEPTEE', 'Acceptée par client'),
        ('REFUSEE', 'Refusée par client'),
        ('EXPIREE', 'Expirée'),
    ])
    
    validee_par = models.ForeignKey(User, null=True)
    validee_le = models.DateTimeField(null=True)
    
    # Notes admin
    notes_revision = models.TextField(blank=True)
```

---

## 🔧 IMPLÉMENTATION SUGGÉRÉE

### 1. Mise à jour du signal
```python
@receiver(post_save, sender=DemandeDevis)
def generer_proforma_automatique(sender, instance, created, **kwargs):
    if created:
        # Générer proforma en statut BROUILLON
        proforma = Proforma.objects.create(
            demande_devis=instance,
            statut='BROUILLON',  # ← Nouveau
            ...
        )
        
        # Email admin pour révision
        envoyer_email_admin_nouvelle_demande(instance)
```

### 2. Actions admin
```python
# Dans l'admin Django ou l'API
class ProformaViewSet:
    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """Admin valide la proforma"""
        proforma = self.get_object()
        proforma.statut = 'VALIDEE'
        proforma.validee_par = request.user
        proforma.validee_le = timezone.now()
        proforma.save()
        
        # Email client
        envoyer_email_client_proforma_validee(proforma)
        
        return Response({'status': 'validée'})
    
    @action(detail=True, methods=['post'])
    def ajuster_montants(self, request, pk=None):
        """Admin ajuste les montants"""
        proforma = self.get_object()
        proforma.montant_ht = request.data['montant_ht']
        proforma.montant_tva = request.data['montant_tva']
        proforma.montant_ttc = request.data['montant_ttc']
        proforma.notes_revision = request.data['notes']
        proforma.save()
        
        return Response({'status': 'ajustée'})
```

### 3. Actions client
```python
class DemandeDevisViewSet:
    @action(detail=True, methods=['post'])
    def accepter(self, request, pk=None):
        """Client accepte le devis"""
        demande = self.get_object()
        proforma = demande.proforma
        
        # Vérifier que proforma est VALIDEE
        if proforma.statut != 'VALIDEE':
            return Response(
                {'error': 'Le devis doit être validé avant acceptation'},
                status=400
            )
        
        # Marquer comme acceptée
        demande.statut = 'ACCEPTEE'
        proforma.statut = 'ACCEPTEE'
        demande.save()
        proforma.save()
        
        # Créer DemandeAnalyse
        demande_analyse = DemandeAnalyse.objects.create(
            demande_devis=demande,
            proforma_acceptee=proforma,
            statut='EN_ATTENTE_ECHANTILLONS'
        )
        
        # Email admin + client
        envoyer_email_devis_accepte(demande_analyse)
        
        return Response({
            'status': 'accepté',
            'demande_analyse_id': demande_analyse.id
        })
```

---

## 🎨 INTERFACE UTILISATEUR

### Page "Mes demandes" (Client)

**Pour une DemandeDevis:**
```
┌─────────────────────────────────────────────┐
│ 💰 Proforma N° PRO-2025-0002                │
│                                             │
│ 33,040 FCFA                                 │
│ HT: 28,000 | TVA: 5,040 FCFA              │
│ Valide jusqu'au 29/12/2025                 │
│                                             │
│ [Statut: EN_ATTENTE_VALIDATION]            │
│                                             │
│ [📥 Télécharger PDF estimatif]             │
│ (Estimation sous réserve de validation)    │
└─────────────────────────────────────────────┘
```

**Après validation admin:**
```
┌─────────────────────────────────────────────┐
│ ✅ Proforma N° PRO-2025-0002 - VALIDÉE      │
│                                             │
│ 33,040 FCFA                                 │
│ HT: 28,000 | TVA: 5,040 FCFA              │
│ Valide jusqu'au 29/12/2025                 │
│                                             │
│ [📥 Télécharger PDF]  [✅ Accepter ce devis]│
│                       [❌ Refuser]          │
└─────────────────────────────────────────────┘
```

**Après acceptation:**
```
┌─────────────────────────────────────────────┐
│ 📋 Demande d'Analyse N° DAN-2025-0001       │
│ (Devis PRO-2025-0002 accepté)              │
│                                             │
│ Statut: EN ATTENTE DES ÉCHANTILLONS        │
│                                             │
│ 📍 Veuillez déposer vos échantillons à:    │
│    LANEMA, Route Abobo-Adjamé              │
│    Tél: +225 27 21 27 86 90                │
│                                             │
│ [📄 Voir le devis]  [📞 Contacter]         │
└─────────────────────────────────────────────┘
```

---

## ✅ AVANTAGES DE CETTE APPROCHE

1. **Transparence**
   - Client voit estimation immédiate
   - Sait que c'est un estimatif

2. **Contrôle qualité**
   - Admin peut réviser avant validation
   - Ajuster si nécessaire

3. **Engagement clair**
   - Séparation devis (gratuit) / analyse (payant)
   - Client s'engage explicitement

4. **Traçabilité**
   - Historique complet des actions
   - Statuts clairs

---

## 🔄 MIGRATION DU CODE EXISTANT

### Étapes:
1. Ajouter champs `statut` aux modèles
2. Créer modèle `DemandeAnalyse`
3. Migrer données existantes
4. Mettre à jour signals
5. Ajouter actions admin/client dans API
6. Mettre à jour frontend

---

## 📧 COMMUNICATIONS AUTOMATIQUES

### Email 1: Nouvelle demande (→ Admin)
```
Sujet: Nouvelle demande de devis #DEV-20251129-0004

Une nouvelle demande de devis a été soumise:
- Client: client@sococe.ci
- Type: Chimie alimentaire
- Montant estimé: 33,040 FCFA

Merci de réviser et valider dans l'administration.

[Voir la demande]
```

### Email 2: Proforma validée (→ Client)
```
Sujet: Votre devis LANEMA est prêt

Bonjour,

Votre demande de devis #DEV-20251129-0004 a été validée.

Montant: 33,040 FCFA TTC
Valable jusqu'au: 29/12/2025

Pour accepter ce devis et procéder à l'analyse:
[Accepter le devis]

[Télécharger le PDF]
```

### Email 3: Devis accepté (→ Client + Admin)
```
Sujet: Devis accepté - Prochaines étapes

Bonjour,

Votre devis a été accepté.

Prochaine étape: Déposer vos échantillons à:
LANEMA, Route Abobo-Adjamé
Tél: +225 27 21 27 86 90

Référence à mentionner: DAN-2025-0001
```

---

## 🎯 CONCLUSION

**RECOMMANDATION FINALE: Option C (Hybride)**

- ✅ Proforma automatique immédiate (statut BROUILLON)
- ✅ Admin révise et valide
- ✅ Client accepte explicitement
- ✅ Création DemandeAnalyse uniquement après acceptation
- ✅ Séparation claire devis/analyse
- ✅ Workflow professionnel et contrôlé

Cette approche offre le meilleur équilibre entre:
- Rapidité (client voit estimation immédiate)
- Contrôle (admin peut ajuster)
- Clarté (séparation devis/analyse)
- Professionnalisme (workflow standard des laboratoires)
