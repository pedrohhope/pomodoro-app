"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, PlayCircle, PauseCircle, Clock, Plus, Trash } from 'lucide-react';
import { TimerMode } from './types';

const PomodoroTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<TimerMode>(TimerMode.POMODORO);
    const [backgroundColor, setBackgroundColor] = useState('#f87171');
    const [backgroundImages, setBackgroundImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [rotationInterval, setRotationInterval] = useState(5);
    const [isRotating, setIsRotating] = useState(false);
    const [showColorOptions, setShowColorOptions] = useState(true);
    const [fadeTransition, setFadeTransition] = useState(false);
    const fileInputRef = useRef(null);

    const timerModes = {
        pomodoro: { time: 25, color: '#f87171' },
        shortBreak: { time: 5, color: '#60a5fa' },
        longBreak: { time: 15, color: '#4ade80' },
    };

    const backgroundOptions = [
        { name: 'Red', value: '#f87171' },
        { name: 'Blue', value: '#60a5fa' },
        { name: 'Green', value: '#4ade80' },
        { name: 'Purple', value: '#a78bfa' },
        { name: 'Yellow', value: '#fbbf24' },
        { name: 'Cyan', value: '#22d3ee' },
    ];

    const resetTimer = (selectedMode?: TimerMode) => {
        const newMode = selectedMode || mode;
        setMinutes(timerModes[newMode].time);
        setSeconds(0);
        setIsActive(false);
        setMode(newMode);
        if (backgroundImages.length === 0) {
            setBackgroundColor(timerModes[newMode].color);
        }
    };

    useEffect(() => {
        let interval = null;

        if (isRotating && backgroundImages.length > 1) {
            interval = setInterval(() => {
                handleImageChange((prevIndex: number) =>
                    prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
                );
            }, rotationInterval * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRotating, rotationInterval, backgroundImages.length]);

    const handleImageChange = (indexFn: (prevIndex: number) => number) => {
        setFadeTransition(true);

        setTimeout(() => {
            setCurrentImageIndex(indexFn);

            setTimeout(() => {
                setFadeTransition(false);
            }, 50);
        }, 300);
    };

    const switchMode = (newMode: TimerMode) => {
        resetTimer(newMode);
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const playAlarm = (multiple: number = 1) => {
        let count = 0;

        const play = () => {
            if (count < multiple) {
                const audio = new Audio('/alarm.mp3');
                audio.play().then(() => {
                    count++;
                    setTimeout(play, 1000);
                }).catch(error => console.error("Erro ao tocar o áudio:", error));
            }
        };

        play();
    };


    const handleBackgroundChange = (color: string) => {
        setFadeTransition(true);

        setTimeout(() => {
            setBackgroundImages([]);
            setBackgroundColor(color);

            setTimeout(() => {
                setFadeTransition(false);
            }, 50);
        }, 300);
    };

    const handleImageUpload = (event: any) => {
        const file = event.target.files[0];
        if (file && file.type.substr(0, 6) === 'image/') {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFadeTransition(true);

                setTimeout(() => {
                    setBackgroundImages(prev => [...prev, reader.result] as any);
                    setShowColorOptions(false);
                    if (backgroundImages.length === 0) {
                        setCurrentImageIndex(0);
                    }

                    setTimeout(() => {
                        setFadeTransition(false);
                    }, 50);
                }, 300);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const removeBackgroundImage = (index: number) => {
        setFadeTransition(true);

        setTimeout(() => {
            setBackgroundImages(prev => prev.filter((_, i) => i !== index));

            if (index <= currentImageIndex && currentImageIndex > 0) {
                setCurrentImageIndex(prev => prev - 1);
            }

            if (backgroundImages.length <= 1) {
                setShowColorOptions(true);
                setIsRotating(false);
            }

            setTimeout(() => {
                setFadeTransition(false);
            }, 50);
        }, 300);
    };

    const removeAllBackgroundImages = () => {
        setFadeTransition(true);

        setTimeout(() => {
            setBackgroundImages([]);
            setCurrentImageIndex(0);
            setIsRotating(false);
            setShowColorOptions(true);

            setTimeout(() => {
                setFadeTransition(false);
            }, 50);
        }, 300);
    };

    const toggleRotation = () => {
        if (backgroundImages.length > 1) {
            setIsRotating(!isRotating);
        }
    };

    const updateRotationInterval = (value: string) => {
        const newInterval = parseInt(value);
        if (!isNaN(newInterval) && newInterval > 0) {
            setRotationInterval(newInterval);
        }
    };

    useEffect(() => {
        let interval: string | number | NodeJS.Timeout | null | undefined = null;

        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        clearInterval(interval as NodeJS.Timeout);
                        setIsActive(false);
                        playAlarm(5);
                        return;
                    }
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval || 0);
        }

        return () => clearInterval(interval as NodeJS.Timeout);
    }, [isActive, minutes, seconds]);

    const formatTime = () => {
        const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
        return `${displayMinutes}:${displaySeconds}`;
    };

    return (
        <div
            className={`flex flex-col items-center justify-center min-h-screen p-6 text-white bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${fadeTransition ? 'opacity-90' : 'opacity-100'}`}
            style={{
                backgroundColor: backgroundImages.length > 0 ? 'transparent' : backgroundColor,
                backgroundImage: backgroundImages.length > 0 ? `url(${backgroundImages[currentImageIndex]})` : 'none',
            }}
        >
            <div className="bg-opacity-20 p-8 rounded-xl shadow-xl backdrop-blur-md w-full max-w-md">
                <h1 className="text-4xl font-bold text-center mb-8">Pomodoro Timer</h1>

                <div className="text-9xl font-bold text-center mb-8">
                    {formatTime()}
                </div>

                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={toggleTimer}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black font-bold py-3 px-6 rounded-full transition duration-200"
                    >
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                    <button
                        onClick={() => resetTimer()}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black font-bold py-3 px-6 rounded-full transition duration-200"
                    >
                        Reset
                    </button>
                </div>

                <div className="flex justify-center space-x-2 mb-8">
                    <button
                        onClick={() => switchMode(TimerMode.POMODORO)}
                        className={`py-2 px-4 rounded-full transition duration-200  font-bold ${mode === TimerMode.POMODORO ? ' bg-white text-black  bg-opacity-30' : 'bg-opacity-30'}`}
                    >
                        Pomodoro
                    </button>
                    <button
                        onClick={() => switchMode(TimerMode.SHORTBREAK)}
                        className={`py-2 px-4 rounded-full transition duration-200 font-bold ${mode === TimerMode.SHORTBREAK ? ' bg-white text-black   bg-opacity-30' : ' bg-opacity-30'}`}
                    >
                        Short Break
                    </button>
                    <button
                        onClick={() => switchMode(TimerMode.LONGBREAK)}
                        className={`py-2 px-4 rounded-full transition duration-200  font-bold ${mode === TimerMode.LONGBREAK ? 'bg-white  text-black  bg-opacity-30' : ' bg-opacity-30'}`}
                    >
                        Long Break
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="text-center mb-4 font-semibold">Customize Background</h3>

                    <div className="flex justify-center gap-2 mb-4">
                        <button
                            onClick={() =>
                                // @ts-ignore
                                fileInputRef.current.click()
                            }
                            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black py-2 px-4 rounded-full transition duration-200"
                        >
                            <Plus size={16} />
                            Add Image
                        </button>

                        {backgroundImages.length > 0 && (
                            <button
                                onClick={removeAllBackgroundImages}
                                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black py-2 px-4 rounded-full transition duration-200"
                            >
                                <Trash size={16} />
                                Clear All
                            </button>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {backgroundImages.length > 1 && (
                        <div className="flex flex-col items-center gap-2 mb-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleRotation}
                                    className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black py-2 px-4 rounded-full transition duration-200"
                                    title={isRotating ? "Pause rotation" : "Start rotation"}
                                >
                                    {isRotating ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                                    {isRotating ? "Pause" : "Auto-Rotate"}
                                </button>

                                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-full text-black">
                                    <Clock size={16} />
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={rotationInterval}
                                        onChange={(e) => updateRotationInterval(e.target.value)}
                                        className="w-12 bg-transparent border-b border-white border-opacity-40 text-center focus:outline-none "
                                    />
                                    <span className="text-sm">sec</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {backgroundImages.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-md">
                            {backgroundImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`relative w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${index === currentImageIndex ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                                    onClick={() => handleImageChange(() => index)}
                                >
                                    <img src={image} alt={`Background ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeBackgroundImage(index);
                                        }}
                                        className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-1 hover:bg-opacity-80"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {showColorOptions && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {backgroundOptions.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => handleBackgroundChange(color.value)}
                                    className="w-8 h-8 rounded-full border-2 border-white border-opacity-60 transition-transform hover:scale-110"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-center mt-8">
                    <Bell className="text-white opacity-70" size={24} onClick={() => playAlarm()} />
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimer;