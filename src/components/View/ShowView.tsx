import React, {useState} from "react";
import {ShowViewContent} from "./ShowViewContent";
import {ViewList} from "./ViewList";
import { Routes, Route } from 'react-router-dom';

export const ShowView = () => {
  const [selectedDocument, setSelectedDocument] = useState<HTMLElement | null>(null)

  const selectDocument = (val: HTMLElement) => {
    setSelectedDocument(val)
  }

  return (
      <section className="flex p-4">
          <Routes>
              <Route
                  path="/dash"
                  element={
                    <header className={`w-full bg-white p-4`}>
                        <h1
                            className={`text-3xl text-ad-hero-title font-medium`}
                        >Tervetuloa</h1>
                    </header>
                  }
              />
              <Route
                  path="/view/:viewid"
                  element={
                      <>
                          <ViewList selectDocument={selectDocument} />
                          <ShowViewContent view={selectedDocument} />
                      </>
                  }
              />
          </Routes>
      </section>
  );
}
