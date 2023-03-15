import {RegisterView} from "./RegisterView";
import {useParams} from 'react-router-dom';
import {ViewHeader} from "./ViewHeader";
import useSchemaStore from '../../store/store';
import { useEffect, useState } from 'react';
import {getViewFromSchemaByName} from "../../utils/Parser";

export const ShowView = () => {
  const [registerView, setRegisterView] = useState(null);
  const schemaInStore = useSchemaStore((state: any) => state.schema);
  const { viewId } = useParams();

  useEffect(() => {
      setRegisterView(getViewFromSchemaByName(schemaInStore, viewId!));
  }, [schemaInStore]);

  return (
      <>
          {registerView && viewId && (
              <ViewHeader
                  heading={registerView.documentElement.getAttribute('Header')!}
              />
          )}

          <section className={`flex flex-col pb-4`}>
              {registerView && viewId && (
                  <RegisterView
                      key={registerView.documentElement.getAttribute('Name')}
                      view={registerView.documentElement!}
                  />
              )}
          </section>
      </>
  );
}
