'use client'

import { FileModal } from '@/db/schema'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

type Props = {}


const UploadContainer = (props: Props) => {

    // Access the client
  const queryClient = useQueryClient()

    // Queries
    const {data: files, isLoading} = useQuery({ queryKey: ['files'], queryFn: () => {
        return axios.post('/api/get-files')
    } })

    const {mutate, isPending} = useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData()
            formData.append('file', file)
            return axios.post('/api/upload', formData)
        },
        onSuccess: () => {
          // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['files'] })
        },
      })

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        mutate(acceptedFiles[0])
    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    return (
        <div className='h-full w-full flex flex-col items-center'>

            <div {...getRootProps()} className='border-2 border-dashed border-gray-300 rounded-lg p-4 mt-20 w-[80%]'>
                <input {...getInputProps()} />
                {
                    isPending ? <p className='text-center text-gray-500 text-sm'>Uploading...</p> :
                    <p className='text-center text-gray-500 text-sm'>
                        点击上传或者拖动文件到此
                    </p>
                }
            </div>

            {
                isLoading ? <p className='text-gray-500 text-sm text-center mt-20'>Loading...</p> :
                files?.data.map((file: FileModal) => (
                    <p key={file.id} className=' text-sm text-center mt-10 w-[80%] border-b-2 border-dashed'>{file.file_name}</p>
                ))
            }
        </div>
    )
}
export default UploadContainer