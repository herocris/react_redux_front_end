import { EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { useActivityView } from '../hooks';

export const ActivityView = () => {
  const {
    activities,
    LoadingEntities,
    columnsTable,
    loading,
    tableOptions
  } = useActivityView()
  return (
    <>
      <GrapLayout>
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
