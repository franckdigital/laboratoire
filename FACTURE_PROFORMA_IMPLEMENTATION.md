# 💰 IMPLÉMENTATION FACTURE PROFORMA - LANEMA

**Date**: 29 Novembre 2024  
**Version**: 1.0  
**Statut**: 📋 Spécifications pour développement backend

---

## 🎯 OBJECTIF

Générer automatiquement une **facture proforma** lors de la création d'une demande de devis, téléchargeable par le client et l'administrateur, avec des tarifs basés sur des paramètres internes.

---

## 📊 WORKFLOW COMPLET

```
Client remplit formulaire devis
          ↓
    Backend reçoit demande
          ↓
    Calcul automatique des tarifs (paramètres internes)
          ↓
    Génération PDF Proforma
          ↓
    Stockage dans système fichiers
          ↓
    Retour au client avec lien téléchargement
          ↓
Client peut télécharger proforma
Admin peut voir/télécharger proforma
          ↓
    [Plus tard] Demande acceptée
          ↓
    Génération Facture définitive (différente de proforma)
```

---

## 🗂️ STRUCTURE BASE DE DONNÉES

### 1. Table: `facturation_proforma`

```python
class Proforma(models.Model):
    """Facture proforma (devis chiffré)"""
    
    numero = models.CharField(max_length=50, unique=True)  # PRO-2024-0001
    demande_devis = models.OneToOneField(
        'demandes.DemandeDevis', 
        on_delete=models.CASCADE,
        related_name='proforma'
    )
    
    # Dates
    date_emission = models.DateField(auto_now_add=True)
    date_validite = models.DateField()  # +30 jours par défaut
    
    # Montants
    montant_ht = models.DecimalField(max_digits=10, decimal_places=2)
    montant_tva = models.DecimalField(max_digits=10, decimal_places=2)
    montant_ttc = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Détails
    lignes_details = models.JSONField()  # Liste des analyses + tarifs
    notes = models.TextField(blank=True)
    conditions_paiement = models.TextField(default="Paiement avant prestation")
    
    # Fichiers
    pdf_url = models.FileField(upload_to='proformas/%Y/%m/')
    pdf_genere_le = models.DateTimeField(auto_now_add=True)
    
    # Statut
    statut = models.CharField(max_length=20, choices=[
        ('VALIDE', 'Valide'),
        ('EXPIRE', 'Expiré'),
        ('ACCEPTE', 'Accepté'),
        ('REFUSE', 'Refusé'),
    ], default='VALIDE')
    
    class Meta:
        db_table = 'facturation_proforma'
        verbose_name = 'Facture Proforma'
        verbose_name_plural = 'Factures Proforma'
```

### 2. Table: `facturation_grille_tarifs`

```python
class GrilleTarifs(models.Model):
    """Grille de tarification par type d'analyse"""
    
    type_analyse = models.CharField(max_length=100, choices=[
        ('MICROBIOLOGIE_PARASITOLOGIE', 'Microbiologie et parasitologie'),
        ('CHIMIE_ALIMENTAIRE_INDUSTRIELLE', 'Chimie alimentaire et industrielle'),
        ('EAUX_CONSOMMATION', 'Eaux de consommation'),
        ('SOLS_ENGRAIS', 'Sols et engrais'),
        ('METROLOGIE', 'Analyses de métrologie'),
        ('ETALONNAGE_INSTRUMENTS', 'Étalonnage instruments'),
        ('ETALONNAGE_VERRERIE', 'Étalonnage verrerie'),
    ])
    
    categorie = models.CharField(max_length=200)
    
    # Tarifs de base
    tarif_base_ht = models.DecimalField(max_digits=10, decimal_places=2)
    tarif_par_echantillon = models.DecimalField(max_digits=10, decimal_places=2)
    tarif_urgence_supplement = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=0,
        help_text="Pourcentage de majoration pour analyse urgente"
    )
    
    # Paramètres
    duree_analyse_jours = models.IntegerField(default=7)
    description_prestation = models.TextField()
    
    # Actif
    est_actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'facturation_grille_tarifs'
        verbose_name = 'Grille de tarifs'
        verbose_name_plural = 'Grilles de tarifs'
        unique_together = ['type_analyse', 'categorie']
```

### 3. Table: `facturation_parametres`

```python
class ParametresFacturation(models.Model):
    """Paramètres globaux de facturation"""
    
    # TVA
    taux_tva = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=18.00,
        help_text="Taux de TVA en pourcentage"
    )
    
    # Remises
    remise_client_premium = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        help_text="Remise pour clients premium (%)"
    )
    
    remise_volume_seuil = models.IntegerField(
        default=10,
        help_text="Nombre d'échantillons pour remise volume"
    )
    
    remise_volume_taux = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        help_text="Taux de remise volume (%)"
    )
    
    # Validité
    duree_validite_proforma_jours = models.IntegerField(default=30)
    
    # Infos société
    nom_societe = models.CharField(max_length=200, default="LANEMA")
    adresse = models.TextField()
    telephone = models.CharField(max_length=20)
    email = models.EmailField()
    site_web = models.URLField(blank=True)
    numero_contribuable = models.CharField(max_length=50)
    logo_url = models.FileField(upload_to='logos/', blank=True)
    
    # Conditions
    conditions_generales = models.TextField()
    mentions_legales = models.TextField()
    
    class Meta:
        db_table = 'facturation_parametres'
        verbose_name = 'Paramètres de facturation'
        verbose_name_plural = 'Paramètres de facturation'
```

---

## 🔧 BACKEND - MODIFICATIONS NÉCESSAIRES

### 1. Modèle `DemandeDevis` (demandes/models.py)

Mettre à jour les choix de types d'analyse:

```python
TYPE_ANALYSE_CHOICES = [
    ('MICROBIOLOGIE_PARASITOLOGIE', 'Microbiologie et parasitologie'),
    ('CHIMIE_ALIMENTAIRE_INDUSTRIELLE', 'Chimie alimentaire et industrielle'),
    ('EAUX_CONSOMMATION', 'Eaux de consommation / Eaux potables'),
    ('SOLS_ENGRAIS', 'Sols et engrais'),
    ('METROLOGIE', 'Analyses de métrologie'),
    ('ETALONNAGE_INSTRUMENTS', 'Étalonnage et vérification d\'instruments'),
    ('ETALONNAGE_VERRERIE', 'Étalonnage de verrerie de laboratoire'),
]
```

### 2. Service de calcul de tarifs (facturation/services.py)

```python
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from .models import GrilleTarifs, ParametresFacturation

class CalculateurTarifs:
    """Service de calcul automatique des tarifs"""
    
    def __init__(self):
        self.params = ParametresFacturation.objects.first()
    
    def calculer_proforma(self, demande_devis):
        """
        Calcule le montant total d'une proforma
        
        Returns:
            dict: {
                'montant_ht': Decimal,
                'montant_tva': Decimal,
                'montant_ttc': Decimal,
                'lignes_details': list,
                'remises_appliquees': list
            }
        """
        lignes = []
        total_ht = Decimal('0.00')
        remises = []
        
        # 1. Récupérer la grille tarifaire
        try:
            grille = GrilleTarifs.objects.get(
                type_analyse=demande_devis.type_analyse,
                categorie=demande_devis.categorie,
                est_actif=True
            )
        except GrilleTarifs.DoesNotExist:
            raise ValueError(
                f"Aucune grille tarifaire trouvée pour "
                f"{demande_devis.type_analyse} - {demande_devis.categorie}"
            )
        
        # 2. Tarif de base
        tarif_base = grille.tarif_base_ht
        lignes.append({
            'designation': f"Analyse {grille.get_type_analyse_display()}",
            'categorie': grille.categorie,
            'quantite': 1,
            'prix_unitaire': float(tarif_base),
            'total': float(tarif_base)
        })
        total_ht += tarif_base
        
        # 3. Tarifs par échantillon
        nb_echantillons = demande_devis.echantillons.count()
        if nb_echantillons > 0:
            tarif_echantillons = grille.tarif_par_echantillon * nb_echantillons
            lignes.append({
                'designation': 'Analyse par échantillon',
                'categorie': grille.categorie,
                'quantite': nb_echantillons,
                'prix_unitaire': float(grille.tarif_par_echantillon),
                'total': float(tarif_echantillons)
            })
            total_ht += tarif_echantillons
        
        # 4. Supplément urgence
        if demande_devis.priorite == 'URGENTE':
            supplement = total_ht * (grille.tarif_urgence_supplement / 100)
            lignes.append({
                'designation': 'Supplément analyse urgente',
                'categorie': f"{grille.tarif_urgence_supplement}%",
                'quantite': 1,
                'prix_unitaire': float(supplement),
                'total': float(supplement)
            })
            total_ht += supplement
        
        # 5. Remise client premium
        if demande_devis.client.type_client == 'PREMIUM':
            remise_taux = self.params.remise_client_premium
            remise_montant = total_ht * (remise_taux / 100)
            remises.append({
                'type': 'Client Premium',
                'taux': float(remise_taux),
                'montant': float(remise_montant)
            })
            total_ht -= remise_montant
        
        # 6. Remise volume
        if nb_echantillons >= self.params.remise_volume_seuil:
            remise_taux = self.params.remise_volume_taux
            remise_montant = total_ht * (remise_taux / 100)
            remises.append({
                'type': 'Remise volume',
                'taux': float(remise_taux),
                'montant': float(remise_montant)
            })
            total_ht -= remise_montant
        
        # 7. Calcul TVA
        montant_tva = total_ht * (self.params.taux_tva / 100)
        montant_ttc = total_ht + montant_tva
        
        return {
            'montant_ht': total_ht,
            'montant_tva': montant_tva,
            'montant_ttc': montant_ttc,
            'lignes_details': lignes,
            'remises_appliquees': remises,
            'duree_analyse': grille.duree_analyse_jours,
            'date_validite': timezone.now().date() + timedelta(
                days=self.params.duree_validite_proforma_jours
            )
        }
```

### 3. Générateur de PDF (facturation/pdf_generator.py)

```python
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfgen import canvas
from io import BytesIO
from django.conf import settings
import os

class GenerateurProformaPDF:
    """Générateur de PDF pour facture proforma"""
    
    def __init__(self, proforma):
        self.proforma = proforma
        self.params = ParametresFacturation.objects.first()
        self.buffer = BytesIO()
    
    def generer(self):
        """
        Génère le PDF de la proforma
        
        Returns:
            BytesIO: Buffer contenant le PDF
        """
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # 1. En-tête avec logo
        story.append(self._generer_entete())
        story.append(Spacer(1, 1*cm))
        
        # 2. Titre
        titre_style = ParagraphStyle(
            'Titre',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#1e40af'),
            alignment=1  # Centré
        )
        story.append(Paragraph("FACTURE PROFORMA", titre_style))
        story.append(Spacer(1, 0.5*cm))
        
        # 3. Infos facture et client
        story.append(self._generer_infos())
        story.append(Spacer(1, 1*cm))
        
        # 4. Tableau des lignes
        story.append(self._generer_tableau_lignes())
        story.append(Spacer(1, 1*cm))
        
        # 5. Totaux
        story.append(self._generer_totaux())
        story.append(Spacer(1, 1*cm))
        
        # 6. Conditions de paiement
        story.append(self._generer_conditions())
        
        # 7. Pied de page
        story.append(Spacer(1, 1*cm))
        story.append(self._generer_pied_page())
        
        # Générer le PDF
        doc.build(story)
        self.buffer.seek(0)
        return self.buffer
    
    def _generer_entete(self):
        """En-tête avec logo et infos société"""
        data = [
            [
                Paragraph(f"<b>{self.params.nom_societe}</b><br/>"
                         f"{self.params.adresse}<br/>"
                         f"Tél: {self.params.telephone}<br/>"
                         f"Email: {self.params.email}", 
                         getSampleStyleSheet()['Normal']),
                Paragraph(f"<b>Numéro:</b> {self.proforma.numero}<br/>"
                         f"<b>Date:</b> {self.proforma.date_emission.strftime('%d/%m/%Y')}<br/>"
                         f"<b>Valide jusqu'au:</b> {self.proforma.date_validite.strftime('%d/%m/%Y')}", 
                         getSampleStyleSheet()['Normal'])
            ]
        ]
        
        table = Table(data, colWidths=[10*cm, 8*cm])
        table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        return table
    
    def _generer_infos(self):
        """Infos client et demande"""
        client = self.proforma.demande_devis.client
        demande = self.proforma.demande_devis
        
        data = [
            [Paragraph("<b>CLIENT</b>", getSampleStyleSheet()['Normal']),
             Paragraph("<b>DÉTAILS DEMANDE</b>", getSampleStyleSheet()['Normal'])],
            [Paragraph(f"{client.raison_sociale}<br/>"
                      f"{client.adresse or ''}<br/>"
                      f"Tél: {client.telephone}<br/>"
                      f"Email: {client.email}", 
                      getSampleStyleSheet()['Normal']),
             Paragraph(f"<b>Type:</b> {demande.get_type_analyse_display()}<br/>"
                      f"<b>Catégorie:</b> {demande.categorie}<br/>"
                      f"<b>Priorité:</b> {demande.get_priorite_display()}<br/>"
                      f"<b>Échantillons:</b> {demande.echantillons.count()}", 
                      getSampleStyleSheet()['Normal'])]
        ]
        
        table = Table(data, colWidths=[9*cm, 9*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        return table
    
    def _generer_tableau_lignes(self):
        """Tableau des prestations"""
        data = [['Désignation', 'Catégorie', 'Qté', 'P.U. (FCFA)', 'Total (FCFA)']]
        
        lignes = self.proforma.lignes_details
        for ligne in lignes:
            data.append([
                ligne['designation'],
                ligne['categorie'],
                str(ligne['quantite']),
                f"{ligne['prix_unitaire']:,.0f}",
                f"{ligne['total']:,.0f}"
            ])
        
        table = Table(data, colWidths=[6*cm, 4*cm, 2*cm, 3*cm, 3*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (2, 0), (4, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        return table
    
    def _generer_totaux(self):
        """Totaux HT, TVA, TTC"""
        data = [
            ['', '', 'Total HT:', f"{self.proforma.montant_ht:,.0f} FCFA"],
            ['', '', f'TVA ({self.params.taux_tva}%):', f"{self.proforma.montant_tva:,.0f} FCFA"],
            ['', '', 'Total TTC:', f"{self.proforma.montant_ttc:,.0f} FCFA"],
        ]
        
        table = Table(data, colWidths=[6*cm, 4*cm, 4*cm, 4*cm])
        table.setStyle(TableStyle([
            ('ALIGN', (2, 0), (3, -1), 'RIGHT'),
            ('FONTNAME', (2, 0), (3, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (2, 2), (3, 2), 12),
            ('BACKGROUND', (2, 2), (3, 2), colors.HexColor('#dbeafe')),
            ('TEXTCOLOR', (2, 2), (3, 2), colors.HexColor('#1e40af')),
            ('LINEABOVE', (2, 0), (3, 0), 1, colors.grey),
            ('LINEABOVE', (2, 2), (3, 2), 2, colors.HexColor('#1e40af')),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        return table
    
    def _generer_conditions(self):
        """Conditions de paiement"""
        text = (
            f"<b>Conditions de paiement:</b><br/>"
            f"{self.proforma.conditions_paiement}<br/><br/>"
            f"<b>Durée d'analyse estimée:</b> {self.proforma.lignes_details[0].get('duree_analyse', 7)} jours ouvrés<br/><br/>"
            f"<i>Cette proforma est valable jusqu'au {self.proforma.date_validite.strftime('%d/%m/%Y')}. "
            f"Au-delà de cette date, les tarifs sont susceptibles de révision.</i>"
        )
        return Paragraph(text, getSampleStyleSheet()['Normal'])
    
    def _generer_pied_page(self):
        """Pied de page avec mentions légales"""
        text = (
            f"<i>{self.params.nom_societe} - {self.params.numero_contribuable}<br/>"
            f"{self.params.mentions_legales}</i>"
        )
        style = ParagraphStyle(
            'PiedPage',
            parent=getSampleStyleSheet()['Normal'],
            fontSize=8,
            textColor=colors.grey
        )
        return Paragraph(text, style)
```

### 4. Signal pour génération automatique (demandes/signals.py)

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DemandeDevis
from facturation.services import CalculateurTarifs
from facturation.pdf_generator import GenerateurProformaPDF
from facturation.models import Proforma
from django.core.files.base import ContentFile

@receiver(post_save, sender=DemandeDevis)
def generer_proforma_automatique(sender, instance, created, **kwargs):
    """
    Signal qui génère automatiquement une proforma
    lors de la création d'une demande de devis
    """
    if created:
        # 1. Calculer les tarifs
        calculateur = CalculateurTarifs()
        try:
            calculs = calculateur.calculer_proforma(instance)
        except ValueError as e:
            # Log l'erreur mais ne bloque pas la création
            print(f"Erreur calcul tarifs: {e}")
            return
        
        # 2. Créer la proforma
        numero_proforma = f"PRO-{instance.numero.replace('DEV-', '')}"
        proforma = Proforma.objects.create(
            numero=numero_proforma,
            demande_devis=instance,
            date_validite=calculs['date_validite'],
            montant_ht=calculs['montant_ht'],
            montant_tva=calculs['montant_tva'],
            montant_ttc=calculs['montant_ttc'],
            lignes_details=calculs['lignes_details'],
            statut='VALIDE'
        )
        
        # 3. Générer le PDF
        generateur = GenerateurProformaPDF(proforma)
        pdf_buffer = generateur.generer()
        
        # 4. Sauvegarder le fichier
        filename = f"proforma_{numero_proforma}.pdf"
        proforma.pdf_url.save(
            filename,
            ContentFile(pdf_buffer.read()),
            save=True
        )
        
        print(f"✓ Proforma {numero_proforma} générée automatiquement")
```

### 5. Vue API pour téléchargement (facturation/views.py)

```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from .models import Proforma
from .serializers import ProformaSerializer

class ProformaViewSet(viewsets.ReadOnlyModelViewSet):
    """API pour les factures proforma"""
    serializer_class = ProformaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Admin voit toutes les proformas
            return Proforma.objects.all()
        else:
            # Client voit uniquement ses proformas
            return Proforma.objects.filter(
                demande_devis__client=user
            )
    
    @action(detail=True, methods=['get'])
    def telecharger(self, request, pk=None):
        """Télécharger le PDF de la proforma"""
        proforma = self.get_object()
        
        if not proforma.pdf_url:
            return Response(
                {"error": "PDF non disponible"},
                status=404
            )
        
        return FileResponse(
            proforma.pdf_url.open('rb'),
            as_attachment=True,
            filename=f"proforma_{proforma.numero}.pdf"
        )
```

---

## 🎨 FRONTEND - MODIFICATIONS NÉCESSAIRES

### 1. Affichage proforma dans ClientDemandesPage

```typescript
// Dans ClientDemandesPage.tsx - Ajouter bouton téléchargement proforma

{demande.proforma && (
  <a
    href={`${API_BASE_URL}/facturation/proformas/${demande.proforma.id}/telecharger/`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Télécharger proforma
  </a>
)}
```

### 2. Service API frontend (src/services/api.ts)

```typescript
// Ajouter dans api.ts

export const proformaAPI = {
  async list() {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async telecharger(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/telecharger/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Erreur téléchargement proforma')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proforma_${id}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}

// Ajouter au export default
export default {
  // ... autres APIs
  proforma: proformaAPI,
}
```

---

## 📋 DIFFÉRENCE PROFORMA vs FACTURE DÉFINITIVE

| Aspect | Proforma | Facture Définitive |
|--------|----------|-------------------|
| **Moment** | Création demande devis | Après acceptation + réalisation |
| **Valeur** | Estimative | Définitive |
| **Numéro** | PRO-XXXX | FACT-XXXX |
| **Modifiable** | Peut être révise | Immuable une fois émise |
| **Paiement** | Peut exiger paiement anticipé | Facture de solde ou totale |
| **Validité** | 30 jours | Permanente |
| **Statut** | VALIDE/EXPIRE/ACCEPTE/REFUSE | PAYEE/EN_ATTENTE/RETARD |
| **But** | Engagement chiffré | Document comptable légal |

---

## 🚀 ORDRE D'IMPLÉMENTATION

### Phase 1: Base de données ✅
1. Créer modèle `Proforma`
2. Créer modèle `GrilleTarifs`
3. Créer modèle `ParametresFacturation`
4. Migrations

### Phase 2: Calcul de tarifs ✅
1. Service `CalculateurTarifs`
2. Tests unitaires du calculateur
3. Remplir grille tarifaire initiale

### Phase 3: Génération PDF ✅
1. Service `GenerateurProformaPDF`
2. Template PDF avec logo
3. Tests de génération

### Phase 4: Automatisation ✅
1. Signal `post_save` sur `DemandeDevis`
2. Génération automatique proforma
3. Stockage fichier

### Phase 5: API & Frontend ✅
1. ViewSet `ProformaViewSet`
2. Serializer `ProformaSerializer`
3. Route `/facturation/proformas/`
4. Frontend: bouton téléchargement
5. Frontend: affichage montants

### Phase 6: Admin interface ✅
1. Admin Django pour `GrilleTarifs`
2. Admin Django pour `ParametresFacturation`
3. Admin Django pour `Proforma`
4. Interface de gestion des tarifs

---

## ✅ CHECKLIST FINALE

### Backend
- [ ] Modèles créés et migrés
- [ ] Service calcul tarifs implémenté
- [ ] Générateur PDF opérationnel
- [ ] Signal automatique configuré
- [ ] API endpoints créés
- [ ] Tests unitaires écrits
- [ ] Grille tarifaire initiale remplie
- [ ] Paramètres configurés

### Frontend
- [ ] Types d'analyse mis à jour ✅
- [ ] Catégories dynamiques ✅
- [ ] Bouton téléchargement ajouté
- [ ] Service API proforma créé
- [ ] Affichage montants implémenté
- [ ] Tests manuels effectués

### Documentation
- [ ] Documentation technique
- [ ] Guide utilisateur
- [ ] Formation admin

---

## 📞 SUPPORT

Pour questions sur cette implémentation:
- Consulter ce document
- Vérifier les exemples de code
- Tester en environnement de développement d'abord

**Bonne implémentation! 🚀**
