import React from "react";
import "./Loading.css";
// AJUSTA ESTA RUTA A DONDE TENGAS TU IMAGEN:
import logoKallari from "../../assets/imagotipo-sig-kallari.svg";
//import logoKallari from "../../assets/favicon-sig-kallari.svg";

const Loading = ({ text = "CARGANDO SISTEMA..." }) => {
  return (
    <div className="loading-container">
      <div className="loader-wrapper">
        {/* Anillo exterior (Representa Tecnología/Circuitos) */}
        <div className="ring-tech"></div>

        {/* Anillo interior (Representa Naturaleza/Hoja) */}
        <div className="ring-nature"></div>

        {/* Logo Central */}
        <img src={logoKallari} alt="Loading SIG-KALLARI" className="logo-img" />
      </div>

      <p className="loading-text">{text}</p>
    </div>
  );
};

export default Loading;
