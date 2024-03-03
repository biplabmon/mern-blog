import { Button } from 'flowbite-react';
import React from 'react'

const CallToAction = () => {
    return (
        <div className='flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
            <div className='flex-1 flex flex-col justify-center'>
                <h2 className='text-2xl'>Want to learn more about JavaScript?</h2>
                <p className='text-gray-500 my-2'>Check out these resource with 100 JavaScript Projects</p>
                <Button gradientDuoTone="purpleToPink" className='rounded-tl-xl rounded-bl-none'>
                    <a href="https://www.heybiplab.in" target='_blank' rel='noopener noreferrer'>100 JavaScript Project</a>
                </Button>
            </div>
            <div className='p-7 flex-1'>
                <img src="https://bairesdev.mo.cloudinary.net/blog/2023/08/What-Is-JavaScript-Used-For.jpg?tx=w_3840,q_auto" />
            </div>
        </div>
    )
};

export default CallToAction;
