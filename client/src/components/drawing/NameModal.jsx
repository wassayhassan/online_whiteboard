import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

export default function NameModal({nameModel, setNameModel, closeNameModal}) {
    const [nameInput, setNameInput] = useState('');

    async function handleSubmit(e){
        e.preventDefault();
        closeNameModal(nameInput)
        setNameInput('');
    }


  return (

      <Transition appear show={nameModel} as={Fragment}>
        <Dialog as="div" className="relative z-[10000000]" onClose={closeNameModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className=" fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2  text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[400px] h-[130px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-top shadow-xl transition-all">
                  <Dialog.Title
                    as="h1"
                    className="text-2xl font-medium leading-6 text-gray-900"
                  >
                    Enter your name
                  </Dialog.Title>
                  <form onSubmit={handleSubmit}>
                  <div className="mt-3">
                    <input value={nameInput} className="border-[1px] p-1 border-gray-200 h-11 w-[25rem] outline-none" onChange={(e)=> setNameInput(e.target.value)} />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-xl font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                  </form>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}
