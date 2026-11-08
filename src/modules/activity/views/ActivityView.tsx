import { EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { useActivityView } from '../hooks';
import { Button } from '@mui/material';
import { ActivityError } from '../components/ActivityError';

export const ActivityView = () => {
  const {
    activities,
    LoadingEntities,
    columnsTable,
    loading,
    tableOptions,
    errorMessage,
    retryLoading
  } = useActivityView()
  return (
    <>
      <GrapLayout>
        <ActivityError message={errorMessage} />
        {(typeof errorMessage === 'string' ? !!errorMessage : Object.keys(errorMessage).length > 0) &&
          <Button disabled={loading} onClick={retryLoading}>Reintentar carga</Button>
        }
        <EntityList
          handleOpen={()=>{}}
          handleOpenDialog={()=>{}}
          LoadingEntities={LoadingEntities}
          setIdEntity={()=>{}}
          EntityCollection={activities}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} 
          editable={false}
          />
      </GrapLayout>
    </>
  )
}
