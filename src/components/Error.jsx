import React from 'react'

const Alerta = ({ children }) => {
    return (
        //se achicó el tamaño de margin y text para que entren mejor en caso de mostrar todos los mensajes de alerta
        <div className="my-2">
            <div className='flex text-orange-500 font-semibold font-messina text-[12px]'>
            <p>* &nbsp;</p>
            {children}
            </div>
            {/* en alerta recibimos como children el mensaje de error */}
        </div>
    )
}

export default Alerta