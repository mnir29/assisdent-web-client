import React, {ChangeEventHandler} from "react";
import {useNavigate} from "react-router-dom";
import {sortByDocumentHeader} from "../../utils/sortingUtils";
import {useIsFetching, useQuery} from "@tanstack/react-query";
import {getRegisterViewsFromSchema} from "../../utils/Parser";
import useSchemaStore from "../../store/store";
import { useEffect, useState } from "react";

export const ViewList = ({className}: { className?: string }) => {
  const [registerViews, setRegisterViews] = useState([]);
  const navigate = useNavigate()
  const schemaInStore = useSchemaStore((state: any) => state.schema);
  const isLoading = useIsFetching(["schema", "metaview", "register", "all"]) > 0

  const handleOnChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
    evt.preventDefault()
    navigate(`view/${evt.target.value}`)
  }

  useEffect(() => {
      console.log('ViewList updated');
      setRegisterViews(getRegisterViewsFromSchema(schemaInStore));
      console.log(registerViews);
  }, []);

  const registerViewNames = registerViews?.sort(sortByDocumentHeader).map((doc: Document) => {
    const docName = doc!.documentElement!.getAttribute("Name")!
    const header = doc!.documentElement!.getAttribute("Header") || docName

    return (
      <option key={docName} value={docName}>
        {header}
      </option>
    )
  })

  return (
      <div className={`px-8 py-4`}>
          {isLoading && <p>Loading view names...</p>}
          {registerViewNames?.length && (
              <select
                  className={`border-2 border-slate-200 hover:border-blue-400 cursor-pointer rounded p-2 ${className}`}
                  onChange={handleOnChange}
              >
                  {registerViewNames}
              </select>
          )}
      </div>
  );
}
