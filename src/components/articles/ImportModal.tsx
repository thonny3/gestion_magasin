import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import { Upload, FileText, Download, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
  warnings: { row: number; message: string }[];
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
      
      // Simulate file preview
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        // In a real app, you would parse the CSV here
        setPreviewData([
          { code_article: 'ART001', designation: 'Ordinateur portable', prix_unitaire: 1200, stock_actuel: 10 },
          { code_article: 'ART002', designation: 'Souris sans fil', prix_unitaire: 25, stock_actuel: 50 },
          { code_article: 'ART003', designation: 'Clavier mécanique', prix_unitaire: 85, stock_actuel: 30 }
        ]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setImportResult(null);
      
      // Simulate file preview
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setPreviewData([
          { code_article: 'ART001', designation: 'Ordinateur portable', prix_unitaire: 1200, stock_actuel: 10 },
          { code_article: 'ART002', designation: 'Souris sans fil', prix_unitaire: 25, stock_actuel: 50 },
          { code_article: 'ART003', designation: 'Clavier mécanique', prix_unitaire: 85, stock_actuel: 30 }
        ]);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate import results
    const result: ImportResult = {
      success: 2,
      errors: [
        { row: 3, message: 'Code article déjà existant' }
      ],
      warnings: [
        { row: 1, message: 'Prix unitaire semble élevé' }
      ]
    };

    setImportResult(result);
    setImporting(false);

    if (result.success > 0) {
      onImport(previewData.slice(0, result.success));
    }
  };

  const downloadTemplate = () => {
    const csvContent = `code_article,designation,description,unite_mesure,categorie,prix_unitaire,stock_minimum,stock_actuel,fournisseur,marque
ART001,Ordinateur portable,Ordinateur portable Dell,pièce,Équipements,1200.00,5,10,Dell,Dell
ART002,Souris sans fil,Souris optique sans fil,pièce,Équipements,25.00,10,50,Logitech,Logitech`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'template_articles.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetModal = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importer des Articles" size="lg">
      <div className="space-y-6">
        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">Modèle d'importation</h4>
              <p className="text-sm text-blue-700 mt-1">
                Téléchargez le modèle CSV pour voir le format requis pour l'importation.
              </p>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center space-x-2 mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Download size={16} />
                <span>Télécharger le modèle</span>
              </button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {file ? (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <p className="text-lg font-medium text-green-900">{file.name}</p>
              <p className="text-sm text-green-700">
                Fichier sélectionné ({(file.size / 1024).toFixed(1)} Ko)
              </p>
              <button
                onClick={() => setFile(null)}
                className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"
              >
                <X size={16} />
                <span>Supprimer</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-lg font-medium text-slate-900">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-sm text-slate-600">
                ou cliquez pour sélectionner un fichier
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Sélectionner un fichier
              </button>
              <p className="text-xs text-slate-500">
                Formats acceptés: CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          )}
        </div>

        {/* Preview Data */}
        {previewData.length > 0 && !importResult && (
          <div>
            <h4 className="text-lg font-medium text-slate-900 mb-3">Aperçu des données</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Désignation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {previewData.slice(0, 3).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-slate-900">{item.code_article}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{item.designation}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{item.prix_unitaire} €</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{item.stock_actuel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 3 && (
                <div className="px-4 py-2 bg-slate-50 text-sm text-slate-600">
                  ... et {previewData.length - 3} autre{previewData.length - 3 > 1 ? 's' : ''} ligne{previewData.length - 3 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-900">Résultat de l'importation</h4>
            
            {/* Success */}
            {importResult.success > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {importResult.success} article{importResult.success > 1 ? 's' : ''} importé{importResult.success > 1 ? 's' : ''} avec succès
                  </span>
                </div>
              </div>
            )}

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Erreurs détectées:</p>
                    <ul className="mt-2 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700">
                          Ligne {error.row}: {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {importResult.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Avertissements:</p>
                    <ul className="mt-2 space-y-1">
                      {importResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-700">
                          Ligne {warning.row}: {warning.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {importResult ? 'Fermer' : 'Annuler'}
          </button>
          
          {file && !importResult && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {importing ? 'Importation...' : 'Importer'}
            </button>
          )}
          
          {importResult && (
            <button
              onClick={resetModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Nouvelle Importation
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

