import { useCallback, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { startLoadingActivities } from '../thunks';
import type { LoadEntities } from '../../../shared/interfaces/sharedInterfaces';

export const useActivityView = () => {
  const { tableOptions, loading, errorMessage, activities } = useAppSelector((state: RootState) => state.activity);
  const dispatch = useAppDispatch();
  const lastRequest = useRef<Parameters<LoadEntities> | null>(null);

  const LoadingEntities = useCallback((
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string,
    signal?: AbortSignal
  ) => {
    lastRequest.current = [page, sortBy, sortType, pageSize, filterField, filterValue, signal];
    return dispatch(startLoadingActivities(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
      .catch(() => {
        // The thunk records errors in the module state.
      });
  }, [dispatch]);

  const retryLoading = () => {
    // Reuse the list effect's signal so changing parameters or unmounting also cancels retries.
    if (loading || !lastRequest.current || lastRequest.current[6]?.aborted) return;
    return LoadingEntities(...lastRequest.current);
  };

  const columnsTable = ['id', 'tipo_de_evento','descripcion','id_usuario','usuario','cambios','fecha']

  return {
    activities,
    tableOptions,
    loading,
    columnsTable,
    errorMessage,
    LoadingEntities,
    retryLoading,
  }
}
