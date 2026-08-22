import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { AiOutlineDownload } from "react-icons/ai";
import Reveal from "../Reveal";
import pdf from "../../Assets/Fidel-Jon-Magat-CV.pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ResumeNew() {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  return (
    <main>
      <section className="page-head container-x">
        <Reveal>
          <p className="eyebrow">Resume</p>
          <h1 className="display-hero">
            Curriculum <span className="serif-accent">vitae</span>
          </h1>
        </Reveal>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container-x">
          <Reveal delay={80}>
            <div className="resume-panel">
              <Document file={pdf}>
                <Page pageNumber={1} scale={width > 786 ? 1.7 : 0.6} />
              </Document>
            </div>

            <div className="resume-actions">
              <a
                href={pdf}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-primary"
                style={{ alignSelf: "center" }}
              >
                <AiOutlineDownload />
                Download CV
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default ResumeNew;
