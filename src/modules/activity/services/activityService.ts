import api from '../../../api/graphdataApi';
import dayjs from 'dayjs';
import type { ListParams } from '../../../api/catalog';
import type { ActivityListResponse } from '../types';
export const activityService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<ActivityListResponse>(
            `/activity?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(({ identificador: id, cambios, fecha, ...rest }) => ({
            id, cambios: JSON.stringify(cambios), fecha: dayjs(fecha).format('DD-MM-YYYY HH:mm:ss'), ...rest,
        })), tableOptions };
    },
};
