import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { combineOptionsStatus } from '../../resouce/queries/optionsStatus';
import { useDrugOptions } from '../../drug/queries/useDrugOptions';
import { useDrugPresentationOptions } from '../../drugPresentation/queries/useDrugPresentationOptions';
import { getApiErrorText } from '../../../api/apiErrors';
import { drugConfiscationListOptions, drugConfiscationMutationOptions } from '../queries/drugConfiscationQueries';
import type { DrugConfiscation } from '../types';

export const useDrugConfiscation = () => {
    const { confiscationId = '' } = useParams();
    const client = useQueryClient();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [active, setActive] = useState<DrugConfiscation>();
    const [open, setOpen] = useState(false);
    const [dialog, setDialog] = useState(false);
    const { options: drugCollection, query: optionsQuery } = useDrugOptions();
    const { options: drugPresentationCollection, query: presentationQuery } = useDrugPresentationOptions();
    const optionsStatus = combineOptionsStatus(optionsQuery, presentationQuery);
    const query = useQuery(drugConfiscationListOptions(confiscationId, {
        page: page + 1, per_page: pageSize, sortBy: '', orderType: '', search_by: '', valueSearch: '',
    }));
    const mutation = useMutation(drugConfiscationMutationOptions(client, confiscationId, () => {
        setOpen(false); setDialog(false); setActive(undefined);
    }));
    useEffect(() => {
        if (!query.data || query.isFetching || query.isError || query.data.rows.length) return;
        const last = Math.max(0, Math.ceil(query.data.tableOptions.total / pageSize) - 1);
        if (page > last) setPage(last);
    }, [query.data, query.isFetching, query.isError, page, pageSize]);
    const empty: DrugConfiscation = {
        cantidad: 0, decomiso: Number(confiscationId), droga: 0, foto: '',
        peso: 0, presentacion: 0,
    };
    const handleOpen = (value: boolean) => {
        if (mutation.isPending) return;
        mutation.reset();
        setOpen(value);
        if (!value) { setActive(undefined); setDialog(false); }
    };
    const setId = (id: string | number) => {
        if (mutation.isPending || query.isError || !query.data) return;
        mutation.reset();
        setActive(id === 0 ? empty : query.data.rows.find(row => row.identificador === id));
    };
    return {
        optionsStatus, drugCollection, drugPresentationCollection,
        loading: mutation.isPending, errorMessage: mutation.isError ? getApiErrorText(mutation.error) : '',
        listLoading: query.isFetching, listError: query.isError ? getApiErrorText(query.error) : '',
        retryList: () => void query.refetch(),
        listUnavailable: query.isError || !query.data || mutation.isPending,
        page, pageSize, total: query.data?.tableOptions.total ?? 0,
        onPageChange: setPage,
        onPageSizeChange: (size: number) => { setPageSize(size); setPage(0); },
        drugConfiscations: query.data?.rows ?? [],
        activeDrugConfiscation: active ?? empty,
        openDrugConfiscationForm: open,
        openDialogDrugConfiscation: dialog,
        handleOpenDrugConfiscationForm: handleOpen,
        handleOpenDialogDrugConfiscation: () => { if (!mutation.isPending) { mutation.reset(); setDialog(value => !value); } },
        setIdDrugConfiscation: setId,
        onDeleteDrugConfiscation: async () => {
            if (mutation.isPending || !active?.identificador) return;
            try { await mutation.mutateAsync({ type: 'delete', id: active.identificador }); }
            catch { /* Mutation owns the error; keep the form and selection. */ }
        },
        onSaveOrUptdateDrugConfiscation: async (values: DrugConfiscation) => {
            await mutation.mutateAsync(active?.identificador === undefined
                ? { type: 'create', values } : { type: 'update', values: { ...values, identificador: active.identificador } });
        },
    };
};
