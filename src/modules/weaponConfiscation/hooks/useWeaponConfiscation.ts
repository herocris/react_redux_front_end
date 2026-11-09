import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { combineOptionsStatus } from '../../resouce/queries/optionsStatus';
import { useWeaponOptions } from '../../weapon/queries/useWeaponOptions';

import { getApiErrorText } from '../../../api/apiErrors';
import { weaponConfiscationListOptions, weaponConfiscationMutationOptions } from '../queries/weaponConfiscationQueries';
import type { WeaponConfiscation } from '../types';

export const useWeaponConfiscation = () => {
    const { confiscationId = '' } = useParams();
    const client = useQueryClient();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [active, setActive] = useState<WeaponConfiscation>();
    const [open, setOpen] = useState(false);
    const [dialog, setDialog] = useState(false);
    const { options: weaponCollection, query: optionsQuery } = useWeaponOptions();

    const optionsStatus = combineOptionsStatus(optionsQuery);
    const query = useQuery(weaponConfiscationListOptions(confiscationId, {
        page: page + 1, per_page: pageSize, sortBy: '', orderType: '', search_by: '', valueSearch: '',
    }));
    const mutation = useMutation(weaponConfiscationMutationOptions(client, confiscationId, () => {
        setOpen(false); setDialog(false); setActive(undefined);
    }));
    useEffect(() => {
        if (!query.data || query.isFetching || query.isError || query.data.rows.length) return;
        const last = Math.max(0, Math.ceil(query.data.tableOptions.total / pageSize) - 1);
        if (page > last) setPage(last);
    }, [query.data, query.isFetching, query.isError, page, pageSize]);
    const empty: WeaponConfiscation = {
        cantidad: 0, decomiso: Number(confiscationId), arma: 0, foto: '',

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
        optionsStatus, weaponCollection,
        loading: mutation.isPending, errorMessage: mutation.isError ? getApiErrorText(mutation.error) : '',
        listLoading: query.isFetching, listError: query.isError ? getApiErrorText(query.error) : '',
        retryList: () => void query.refetch(),
        listUnavailable: query.isError || !query.data || mutation.isPending,
        page, pageSize, total: query.data?.tableOptions.total ?? 0,
        onPageChange: setPage,
        onPageSizeChange: (size: number) => { setPageSize(size); setPage(0); },
        weaponConfiscations: query.data?.rows ?? [],
        activeWeaponConfiscation: active ?? empty,
        openWeaponConfiscationForm: open,
        openDialogWeaponConfiscation: dialog,
        handleOpenWeaponConfiscationForm: handleOpen,
        handleOpenDialogWeaponConfiscation: () => { if (!mutation.isPending) { mutation.reset(); setDialog(value => !value); } },
        setIdWeaponConfiscation: setId,
        onDeleteWeaponConfiscation: async () => {
            if (mutation.isPending || !active?.identificador) return;
            try { await mutation.mutateAsync({ type: 'delete', id: active.identificador }); }
            catch { /* Mutation owns the error; keep the form and selection. */ }
        },
        onSaveOrUptdateWeaponConfiscation: async (values: WeaponConfiscation) => {
            await mutation.mutateAsync(active?.identificador === undefined
                ? { type: 'create', values } : { type: 'update', values: { ...values, identificador: active.identificador } });
        },
    };
};
