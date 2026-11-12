import { useAccess } from '../../auth/hooks/useAccess';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { Confiscation } from '../types';
import { confiscationMutationOptions } from '../queries/confiscationQueries';

export const useConfiscationForm = (initial?: Confiscation) => {
    const navigate = useNavigate();
    const access = useAccess('confiscation');
    const client = useQueryClient();
    const [openMap, setOpenMap] = useState(false);
    const mutation = useMutation(confiscationMutationOptions(client, (data, write) => {
        if (write.type === 'create' && data) navigate(`/confiscation/${access.update ? 'edit' : 'detail'}/${data.id}`);
    }));
    return {
        openMap, handleOpenMap: setOpenMap,
        onSaveOrUptdate: async (values: Confiscation) => {
            await mutation.mutateAsync(initial?.id === undefined
                ? { type: 'create', values } : { type: 'update', values: { ...values, id: initial.id } });
        },
    };
};
