import helpers from './helpers.js';

window.addEventListener( 'load', () => {
    //When the chat icon is clicked
    let command = location.href;

    if(command.search('create') != -1) {
        createRoom();
    }

    // else {
    //     enterRoom();
    // }

    document.querySelector( '#toggle-chat-pane' ).addEventListener( 'click', ( e ) => {
        let chatElem = document.querySelector( '#chat-pane' );
        let mainSecElem = document.querySelector( '#main-section' );

        if ( chatElem.classList.contains( 'chat-opened' ) ) {
            chatElem.setAttribute( 'hidden', true );
            mainSecElem.classList.remove( 'col-md-9' );
            mainSecElem.classList.add( 'col-md-12' );
            chatElem.classList.remove( 'chat-opened' );
        }

        else {
            chatElem.attributes.removeNamedItem( 'hidden' );
            mainSecElem.classList.remove( 'col-md-12' );
            mainSecElem.classList.add( 'col-md-9' );
            chatElem.classList.add( 'chat-opened' );
        }

        //remove the 'New' badge on chat icon (if any) once chat is opened.
        setTimeout( () => {
            if ( document.querySelector( '#chat-pane' ).classList.contains( 'chat-opened' ) ) {
                helpers.toggleChatNotificationBadge();
            }
        }, 300 );
    } );


    //When the video frame is clicked. This will enable picture-in-picture
    document.getElementById( 'local' ).addEventListener( 'click', () => {
        if ( !document.pictureInPictureElement ) {
            document.getElementById( 'local' ).requestPictureInPicture()
                .catch( error => {
                    // Video failed to enter Picture-in-Picture mode.
                    console.error( error );
                } );
        }

        else {
            document.exitPictureInPicture()
                .catch( error => {
                    // Video failed to leave Picture-in-Picture mode.
                    console.error( error );
                } );
        }
    } );


    //When the 'Create room" is button is clicked
    // document.getElementById( 'create-room' ).addEventListener( 'click', ( e ) => {
    //     e.preventDefault();

    //     createRoom();
    // } );


    //When the 'Enter room' button is clicked.
    document.getElementById( 'enter-room' ).addEventListener( 'click', ( e ) => {
        // e.preventDefault();

        enterRoom();
    } );


    document.addEventListener( 'click', ( e ) => {
        if ( e.target && e.target.classList.contains( 'expand-remote-video' ) ) {
            helpers.maximiseStream( e );
        }

        else if ( e.target && e.target.classList.contains( 'mute-remote-mic' ) ) {
            helpers.singleStreamToggleMute( e );
        }
    } );


    document.getElementById( 'closeModal' ).addEventListener( 'click', () => {
        helpers.toggleModal( 'recording-options-modal', false );
    } );
} );

function createRoom() {
            
    let roomName = "test";
    let yourName = "test-teacher";

    if ( roomName && yourName ) {
        //remove error message, if any
        document.querySelector('#err-msg').innerText = "";

        //save the user's name in sessionStorage
        sessionStorage.setItem( 'username', yourName );

        //create room link
        // let roomLink = `${ location.origin }?room=${ roomName.trim().replace( ' ', '_' ) }_${ helpers.generateRandomString() }`;
        let lessonID = location.href;
        lessonID = lessonID.split('create/')[1];
        // let roomLink = `${ location.origin }/courses/test/socket/?room=${lessonID}`;
        let roomLink = `${ location.origin }/courses/live/${lessonID}/?room=${lessonID}`;        
        //show message with link to room
        // document.querySelector( '#room-created' ).innerHTML = `Room successfully created. Click <a href='${ roomLink }'>here</a> to enter room. 
        //     Share the room link with your partners.`;

        // //empty the values
        // document.querySelector( '#room-name' ).value = '';
        // document.querySelector( '#your-name' ).value = '';
        window.open(roomLink, "_self");
    }

    else {
        document.querySelector('#err-msg').innerText = "All fields are required";
    }
}

function enterRoom () {
    let name = "test-student";

    if ( name ) {
        //remove error message, if any
        // document.querySelector('#err-msg-username').innerText = "";

        // let lessonID = location.href;
        // lessonID = lessonID.split('enter/')[0];
        // let roomLink = `${ location.origin }/courses/test/socket/?room=${lessonID}`;
        // let roomLink = lessonID;
        //save the user's name in sessionStorage
        sessionStorage.setItem( 'username', name );

        //reload room
        location.reload();
        // window.open(roomLink, "_self");
    }

    else {
        document.querySelector('#err-msg-username').innerText = "Please input your name";
    }
}