import React from 'react'
import { logohammer } from '../../images';

const ModalSuccess = ({ isVisible, onClose, textoModal }) => {
  if (!isVisible) return null;

  return (
    <div className="h-screen w-full fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100] ">
      <div className='w-[400px] max-sm:w-[300px] flex flex-col'>
        {/* <button className='text-white text-xl place-self-end' onClick={() => onClose()}>X</button> */}
        <div className='top-10 lg:h-[200px] lg:max-h-[300px] bg-white p-2 rounded-xl' >
          <div className=''>
            <img src={logohammer} alt="logo" width={150} className='pt-4 mx-auto' />
          </div>
          <hr className='mt-2 w-5/6 mx-auto' />
          <p className='px-2 py-6 text-center font-messina text-slate-600'>
              {textoModal}  
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModalSuccess