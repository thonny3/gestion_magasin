import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Package, TrendingUp } from 'lucide-react';
import Notification from '../ui/Notification';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Validation en temps réel
  useEffect(() => {
    const errors: { username?: string; password?: string } = {};
    
    if (username.trim() === '') {
      errors.username = 'Le nom d\'utilisateur est requis';
    } else if (username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    
    if (password === '') {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setValidationErrors(errors);
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation finale
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        setShowNotification(true);
        // Rediriger vers la page d'origine ou le dashboard après un court délai
        setTimeout(() => {
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setError(result.message || "Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Object.keys(validationErrors).length === 0 && username.trim() !== '' && password !== '';

  return (
    <div className="min-h-screen flex">
      {/* Notification de succès */}
      {showNotification && (
        <Notification
          type="success"
          title="Connexion réussie !"
          message="Redirection vers votre tableau de bord..."
          onClose={() => setShowNotification(false)}
          autoClose={true}
          duration={1000}
        />
      )}
      {/* Section gauche - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center max-w-md animate-fade-in-left">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 glass rounded-full flex items-center justify-center animate-float overflow-hidden">
                <img src="/logo.jpg" alt="Logo" className="w-20 h-20 object-contain" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">StockManager Pro</h1>
            <p className="text-xl mb-6 text-blue-100">
              Système de gestion de magasin intelligent
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 transition-smooth hover:scale-105">
                <div className="w-8 h-8 glass rounded-full flex items-center justify-center icon-hover">
                  <TrendingUp size={16} />
                </div>
                <span className="text-blue-100">Gestion optimisée des stocks</span>
              </div>
              <div className="flex items-center space-x-3 transition-smooth hover:scale-105">
                <div className="w-8 h-8 glass rounded-full flex items-center justify-center icon-hover">
                  <Package size={16} />
                </div>
                <span className="text-blue-100">Suivi des articles en temps réel</span>
              </div>
              <div className="flex items-center space-x-3 transition-smooth hover:scale-105">
                <div className="w-8 h-8 glass rounded-full flex items-center justify-center icon-hover">
                  <TrendingUp size={16} />
                </div>
                <span className="text-blue-100">Rapports détaillés et analyses</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Formes décoratives */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 gradient-secondary">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-float shadow-md overflow-hidden">
              <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">StockManager Pro</h1>
            <p className="text-gray-600">Connexion à votre compte</p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl card-shadow p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue</h2>
              <p className="text-gray-600">Connectez-vous à votre compte</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom d'utilisateur */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                                     <input
                     id="username"
                     name="username"
                     type="text"
                     required
                     className={`block w-full pl-10 pr-3 py-3 border rounded-lg input-focus transition-smooth ${
                       validationErrors.username 
                         ? 'input-invalid' 
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                     placeholder="Entrez votre nom d'utilisateur"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                   />
                </div>
                                 {validationErrors.username && (
                   <p className="error-message">
                     {validationErrors.username}
                   </p>
                 )}
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                                     <input
                     id="password"
                     name="password"
                     type={showPassword ? 'text' : 'password'}
                     required
                     className={`block w-full pl-10 pr-12 py-3 border rounded-lg input-focus transition-smooth ${
                       validationErrors.password 
                         ? 'input-invalid' 
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                     placeholder="Entrez votre mot de passe"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                                     <button
                     type="button"
                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? (
                       <EyeOff size={20} className="text-gray-400 hover:text-gray-600 icon-hover" />
                     ) : (
                       <Eye size={20} className="text-gray-400 hover:text-gray-600 icon-hover" />
                     )}
                   </button>
                </div>
                                 {validationErrors.password && (
                   <p className="error-message">
                     {validationErrors.password}
                   </p>
                 )}
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

                             {/* Bouton de connexion */}
               <button
                 type="submit"
                 disabled={!isFormValid || isSubmitting}
                 className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white transition-smooth ${
                   isFormValid && !isSubmitting
                     ? 'btn-primary'
                     : 'bg-gray-400 cursor-not-allowed'
                 }`}
               >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Lock size={18} className="mr-2" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Identifiants de test */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Identifiants de test :</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Admin:</span>
                  <span className="text-blue-600">admin / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Utilisateur:</span>
                  <span className="text-blue-600">user / user123</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                💡 <strong>Info:</strong> Une fois connecté, vous ne pourrez plus accéder à cette page 
                jusqu'à ce que vous vous déconnectiez.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
