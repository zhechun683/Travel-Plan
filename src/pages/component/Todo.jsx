/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useReactive } from "ahooks";
import { addPhoto, GetPhotoSrc } from "./db.jsx";
import Popup from "reactjs-popup"; // For our popups
import "reactjs-popup/dist/index.css"; // For the popups to look nicer.
import Webcam from "react-webcam";

const WebcamCapture = (props) => {
    // à 1 Prepare the Hooks
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [imgId, setImgId] = useState(null);
    const [photoSave, setPhotoSave] = useState(false);
    // à 2 When photo save detected call photoedTask in App.js to update task
    // in localStorage to indicate it has a photo. */
    useEffect(() => {
        if (photoSave) {
            console.log("useEffect detected photoSave");
            props.photoedTask(imgId);
            setPhotoSave(false);
        }
    });
    console.log("WebCamCapture", props.id);

    const capture = useCallback(
        (id) => {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
            console.log("capture", imageSrc?.length, id);
        },
        [webcamRef, setImgSrc]
    );
    // à 4 The savePhoto function saved in the const savePhoto
    const savePhoto = (id, imgSrc) => {
        console.log("savePhoto", imgSrc?.length, id);
        addPhoto(id, imgSrc);
        setImgId(id);
        setPhotoSave(true);
        props.close && props.close();
    };
    // à 5 cancelPhoto can be easily improved. Any idea? Easy extra marks!
    const cancelPhoto = (id, imgSrc) => {
        console.log("cancelPhoto", imgSrc?.length, id);
        props.close && props.close();
    };
    // à 6 Let’s return the JSX to be rendered in the screen. Notice the conditionals &&
    return (
        <>
            {!imgSrc && ( // Before image capture show live picture from camera
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            )}
            {imgSrc && <img src={imgSrc} />}
            <div className="btn-group">
                {!imgSrc && ( // Before image capture show capture button &functionality
                    <button
                        type="button"
                        className="btn"
                        onClick={() => capture(props.id)}
                    >
                        Capture photo
                    </button>
                )}
                {imgSrc && ( // After image capture show save button & functionality
                    <button
                        type="button"
                        className="btn"
                        onClick={() => savePhoto(props.id, imgSrc)}
                    >
                        Save Photo
                    </button>
                )}
                <button // Cancel button not implemented but you could fix this.
                    type="button"
                    className="btn todo-cancel"
                    onClick={() => cancelPhoto(props.id, imgSrc)}
                >
                    Cancel
                </button>
            </div>
        </>
    );
};

const ViewPhoto = (props) => {
    // 1 à Retrieving photo by id from IndexedDB using GetPhotoSrc in db.js.
    const photoSrc = GetPhotoSrc(props.id);
    return (
        <>
            <img
                src={photoSrc}
                alt={props.name}
            />
        </>
    );
};

const App = () => {
    const [lastInsertedId, setLastInsertedId] = useState("");

    const state = useReactive({
        list: JSON.parse(localStorage.getItem("list") || "[]"),

        show: [],

        row: {},

        input: "",

        geo: { latitude: "", longitude: "" },
    });

    const addTodo = (todoObj) => {
        state.list.unshift(todoObj);

        setCache(state.list);
    };

    const updateTodo = (id, done) => {
        state.list = state.list.map((item) => (item.id === id ? { ...item, done: done } : item));
        setCache(state.list);
    };

    const delTodo = (id) => {
        state.list = state.list.filter((item) => item.id !== id);
        setCache(state.list);
    };

    const showAll = () => {
        state.show = state.list;
    };

    const showIng = () => {
        state.show = state.list.filter((item) => !item.done);
    };

    const showDone = () => {
        state.show = state.list.filter((item) => item.done);
    };

    const setCache = (param) => {
        localStorage.setItem("list", JSON.stringify(param));
    };

    useEffect(() => {
        state.show = state.list;

        geoFindMe();

        return () => {};
    }, []);

    const geoFindMe = () => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by your browser");
        } else {
            console.log("Locating…");
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    state.geo = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                },
                function (error) {
                    console.log("error - >:", error);
                }
            );
        }
    };

    return (
        <>
            <div className="container">
                <h2 className=" text-center m-3">Travel plan</h2>
                <p className=" text-center mb-3">What needs to be done?</p>

                <div className="">
                    <input
                        className="input-group mb-2 "
                        type="text"
                        style={{ height: "52px" }}
                        value={state.input}
                        onChange={(e) => (state.input = e.target.value)}
                    />
                    <div className="d-grid gap-2">
                        <button
                            className="btn btn-dark"
                            style={{ height: "40px" }}
                            onClick={(e) => {
                                if (state.input === '') {
                                    return;
                                }

                                if (state.row.id) {
                                    state.row.name = state.input;
                                    state.list = state.list.map((item) =>
                                        item.id === state.row.id ? state.row : item
                                    );
                                    setCache(state.list);
                                    state.row = {};
                                } else {
                                    const data = {
                                        id: state.list.length + 1,
                                        name: state.input,
                                        done: false,
                                        geo: state.geo,
                                        location: {},
                                    };
                                    addTodo(data);
                                }

                                state.input = "";
                            }}
                        >
                            {state.row.id ? "Update" : "Add"}
                        </button>
                    </div>
                </div>

                <div className=" text-center mb-3 mt-3 ">
                    <button
                        type="button"
                        className="btn btn-outline-dark ps-4  pe-4 me-2"
                        onClick={showAll}
                    >
                        All
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-dark ps-4  pe-4 me-2"
                        onClick={showIng}
                    >
                        Active
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-dark ps-4  pe-4"
                        onClick={showDone}
                    >
                        Completed
                    </button>
                </div>

                <div
                    style={{ maxHeight: "600px" }}
                    className="overflow-auto"
                >
                    <p>
                        <span>{state.show.length}</span> items left
                    </p>
                    {state.show.map((item) => (
                        <div key={item.id}>
                            <p className="d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    style={{ width: "40px", height: "40px" }}
                                    className="me-2"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateTodo(item.id, e.target.checked);
                                            showIng();
                                        }
                                    }}
                                    disabled={item.done}
                                />{" "}
                                <span
                                    style={{ textDecoration: item.done ? "line-through" : "none" }}
                                >
                                    {item.name} |{" "}
                                    <a
                                        href={`https://www.openstreetmap.org/#map=18/${item.geo.latitude}/${item.geo.longitude}`}
                                        target="_blank"
                                    >
                                        (map)
                                    </a>{" "}
                                    | <a href={item.location.smsURL}>(sms)</a>
                                </span>
                            </p>

                            <p className="d-flex">
                                <button
                                    className="flex-fill btn btn-outline-dark ps-4  pe-4"
                                    onClick={() => {
                                        state.row = item;
                                        state.input = item.name;
                                    }}
                                    disabled={item.done}
                                >
                                    Edit
                                </button>
                                &nbsp;
                                <Popup // à 3
                                    trigger={
                                        <button
                                            type="button"
                                            className="flex-fill btn btn-outline-dark ps-4  pe-4 btn"
                                        >
                                            {" "}
                                            Take Photo{" "}
                                        </button>
                                    }
                                    modal
                                >
                                    {(close) => (
                                        <WebcamCapture
                                            id={item.id}
                                            photoedTask={(id) => {
                                                state.list = state.list.map((item) => {
                                                    if (item.id == id) {
                                                        item.photo = true;
                                                    }
                                                    return item;
                                                });
                                                setCache(state.list);
                                            }}
                                            close={close}
                                        />
                                    )}
                                </Popup>
                                &nbsp;
                                <Popup // à 4
                                    trigger={
                                        <button
                                            type="button"
                                            className="flex-fill btn btn-outline-dark ps-4 btn"
                                        >
                                            {" "}
                                            View Photo{" "}
                                        </button>
                                    }
                                    modal
                                >
                                    <ViewPhoto
                                        id={item.id}
                                        alt={item.name}
                                    />
                                </Popup>
                                &nbsp;
                                <button
                                    className="flex-fill btn btn-danger ps-4  pe-4"
                                    onClick={() => {
                                        delTodo(item.id);
                                        state.show = state.list;
                                    }}
                                >
                                    Delete
                                </button>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default App;
