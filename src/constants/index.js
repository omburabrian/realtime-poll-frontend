/**
 * Application-wide constants.
 * Using Object.freeze to make the objects immutable, which prevents
 * accidental modification elsewhere in the code.
 */

//  These must match those defined in the backend model, PollEvent.STATES.
//  ToDo:  Get these PollEvent.STATES from the backend with a service call.
export const PollEventStates = Object.freeze({
    READY: 'ready',
    OPEN: 'open',
    WAITING: 'waiting',
    STARTED: 'started',
    ENDED: 'ended',
    CANCELED: 'canceled',
    PAUSED: 'paused',
    ERROR: 'error',
});

export const QuestionTypes = Object.freeze({
    MULTIPLE_CHOICE: "multiple_choice",
    TRUE_FALSE: "true_false",
    SHORT_ANSWER: "short_answer",
    OPEN_ENDED: "open_ended",
});

export const SOCKET_MESSAGES = Object.freeze({

    //  Connection messages

    CONNECT: "connect",
    DISCONNECT: "disconnect",
    ERROR: "error",
    CONNECT_ERROR: "connect_error",

    //  Professor Poll Event messages

    OPEN_POLL_EVENT: "open_poll_event",
    UPDATE_POLL_EVENT: "start_poll",
    START_POLL: "start_poll",
    PAUSE_POLL: "pause_poll",
    RESUME_POLL: "resume_poll",
    END_POLL: "end_poll",
    NEXT_QUESTION: "next_question",
    PREVIOUS_QUESTION: "previous_question",

    //  User Poll Event Messages

    JOIN_POLL_EVENT: "join_poll_event",
    LEAVE_POLL_EVENT: "leave_poll_event",

    //  Question messages
 
    SUBMIT_ANSWER: "submit_answer",

    //  General messages (from setting up socket.io)
 
    SEND_MESSAGE: "send_message",
    NEW_MESSAGE: "new_message",

});