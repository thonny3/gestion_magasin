import React, { useState } from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  warningMessage?: string;
  isDangerous?: boolean;
  requireConfirmText?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message,
  itemName,
  itemType = "élément",
  warningMessage,
  isDangerous = false,
  requireConfirmText = false
}: ConfirmDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const defaultMessage = itemName 
    ? `Êtes-vous sûr de vouloir supprimer ${itemType} "${itemName}" ?`
    : `Êtes-vous sûr de vouloir supprimer cet ${itemType} ?`;

  const displayMessage = message || defaultMessage;
  const confirmationText = "SUPPRIMER";

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setIsConfirming(false);
    onClose();
  };

  const canConfirm = requireConfirmText ? confirmText === confirmationText : true;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDangerous ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`w-8 h-8 ${
              isDangerous ? 'text-red-600' : 'text-yellow-600'
            }`} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900 mb-2">
            {displayMessage}
          </p>
          
          {warningMessage && (
            <div className={`mt-3 p-3 rounded-lg border ${
              isDangerous 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              <p className="text-sm">{warningMessage}</p>
            </div>
          )}
        </div>

        {/* Confirmation Text Input */}
        {requireConfirmText && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Pour confirmer, tapez <strong>{confirmationText}</strong> dans le champ ci-dessous :
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirmationText}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>
        )}

        {/* Additional Warning for Dangerous Actions */}
        {isDangerous && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Attention !</p>
                <p>Cette action est irréversible et peut avoir des conséquences importantes.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isConfirming}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Supprimer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Hook pour faciliter l'utilisation
export const useConfirmDelete = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmDeleteModalProps>>({});

  const showConfirm = (options: Partial<ConfirmDeleteModalProps>) => {
    setConfig(options);
    setIsOpen(true);
  };

  const hideConfirm = () => {
    setIsOpen(false);
    setConfig({});
  };

  return {
    isOpen,
    showConfirm,
    hideConfirm,
    ConfirmDeleteModal: (props: Omit<ConfirmDeleteModalProps, 'isOpen' | 'onClose'>) => (
      <ConfirmDeleteModal
        {...props}
        {...config}
        isOpen={isOpen}
        onClose={hideConfirm}
      />
    )
  };
};

