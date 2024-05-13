
var Aksw = Aksw ? Aksw : Aksw = {};

Aksw.Core = function () {

    var internal = {
        elapsedSessionTime: null,

        displayTimeoutWarning: function () {
            var myTimeout = setTimeout(internal.timeoutSession, 60000);

            Aksw.Dialog.showConfirm({
                title: 'Extend Session?',
                text: 'You will be logged out in one minute.  Would you like to extend the session?',
                buttons: ['Extend Session'],
                dialogId: 'TimeoutWarningDialog',
                backdropClose: false,
                callback: function (accept) {
                    if (accept == 'Extend Session') {
                        //Reset the elapsedSessionTime after user extends their session
                        internal.elapsedSessionTime = new Date().getTime();

                        clearTimeout(myTimeout);
                        var config = {};
                        config.url = Aksw.Util.siteRoot + 'Home/ContinueSession';
                        config.showSuccessDialog = false;
                        config.mask = false;
                        config.callback = internal.resetSessionCallback;
                        Aksw.Ajax.post(config);

                    }
                }
            });

        },

        timeoutSession: function () {
            var url = Aksw.Util.siteRoot + 'Login/TimeoutSession';
            url = external.sessionTimeoutURL == null ? url : url + "?SessionTimeoutURL=" + external.sessionTimeoutURL;
            window.location.href = url;            
        },

        resetSessionCallback: function (data) {
            setTimeout(function () { internal.displayTimeoutWarning(); }, 840000)
        },

        checkElapsedSessionTime: function () {
            var diffMs = new Date().getTime() - internal.elapsedSessionTime;

            //If user session has lasted for more than 14 minutes but less than 15
            //and if we aren't already showing the warning dialog, do so now
            if ($('#TimeoutWarningDialog').length == 0 && (diffMs > 840000 && diffMs < 900000)) {
                internal.displayTimeoutWarning();
            }
            //The user session has lasted for more than 15 minutes without choosing to extend the session, log them out
            else if (diffMs > 900000) {
                internal.timeoutSession();
            }
        }
    };

    var external = {
        // customers can set this variable to override the redirection if they want in their custom code.
        sessionTimeoutURL: null,

        init: function () {
            if (isLoggedIn.toLowerCase() == 'true') {
                //Since setTimeout is not 100% reliable(specifically setTimeout does not work well with phones due to the changing sleep/wake state of the device)
                //We will use a backup strategy to constantly monitor the session time of the user by binding to JS events and determining how much time has elapsed since
                //logging in or extending of the session

                //use a time to trigger session timeout
                if ((isLoggedIn.toLowerCase() == 'true') || ((Aksw.App !== undefined) && (Aksw.App.isGuestLoginScreen == true))) {
                    setTimeout(function () { internal.displayTimeoutWarning(); }, 840000)

                    //Begin tracking the user's session time
                    internal.elapsedSessionTime = new Date().getTime();

                    //Bind the checkElapsedSessionTime function to relevent events
                    $(document).mousemove(function (e) { internal.checkElapsedSessionTime(); });
                    $(document).mousedown(function (e) { internal.checkElapsedSessionTime(); });
                    $(document).click(function (e) { internal.checkElapsedSessionTime(); });
                    $(document).keypress(function (e) { internal.checkElapsedSessionTime(); });
                    document.addEventListener("touchstart", internal.checkElapsedSessionTime, true);
                    document.addEventListener('scroll', internal.checkElapsedSessionTime, true);
                }

                // global ajax post to include the http header for anti forgery tokens
                $(document).ajaxSend(function (event, jqxhr, settings) {
                    var tokens = $('#__AntiForgeryTokens').val();
                    jqxhr.setRequestHeader("AntiForgeryTokens", tokens)
                });
            }
        },
        redirectToLogout: function () {
            internal.timeoutSession();
        }
    };
    var initialize = function () {
        $(document).ready(function () {
            external.init();
        });
        

    }(); // putting () executes this as soon as the script is parsed.

    return external;
}();
