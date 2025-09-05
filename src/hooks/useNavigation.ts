import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../types/routes';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goToDashboard = useCallback(() => {
    navigate(ROUTES.DASHBOARD);
  }, [navigate]);

  const goToArticles = useCallback(() => {
    navigate(ROUTES.ARTICLES);
  }, [navigate]);

  const goToReception = useCallback(() => {
    navigate(ROUTES.RECEPTION);
  }, [navigate]);

  const goToSortie = useCallback(() => {
    navigate(ROUTES.SORTIE);
  }, [navigate]);

  const goToDistribution = useCallback(() => {
    navigate(ROUTES.DISTRIBUTION);
  }, [navigate]);

  const goToStock = useCallback(() => {
    navigate(ROUTES.STOCK);
  }, [navigate]);

  const goToPaiement = useCallback(() => {
    navigate(ROUTES.PAIEMENT);
  }, [navigate]);

  const goToMission = useCallback(() => {
    navigate(ROUTES.MISSION);
  }, [navigate]);

  const goToPV = useCallback(() => {
    navigate(ROUTES.PV);
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const isCurrentRoute = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const getCurrentRoute = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);

  return {
    // Navigation functions
    goToDashboard,
    goToArticles,
    goToReception,
    goToSortie,
    goToDistribution,
    goToStock,
    goToPaiement,
    goToMission,
    goToPV,
    goBack,
    
    // Route utilities
    isCurrentRoute,
    getCurrentRoute,
    currentRoute: location.pathname,
  };
};
