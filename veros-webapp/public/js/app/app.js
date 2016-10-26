$(document).ready(function() {
    $('#logoutButton').click(function() {
        $.ajax({
            type: "GET",
            url: "/api/account/logout",
            success: function(result) {
                if (result.success) {
                    window.location = '/explorer'
                }

            }
        });
    });

    $('#explorerSearchButton').click(function() {
        var address = $('#explorerSearchField').val();
        window.location = '/address/'+address;
    });

    $('#explorerSearchForm').submit(function(e) {
        e.preventDefault();
        var address = $('#explorerSearchField').val();
        window.location = '/address/'+address;
    });
});

Pusher.logToConsole = true;

var pusher = new Pusher('c8232accc930eb65dd80', {
    cluster: 'ap1',
    encrypted: true
});

var channel = pusher.subscribe('network_notifications');
channel.bind('new_block', function(data) {
    $.bigBox({
        title : data.message,
        content : "A new block has been added.",
        color : "#C46A69",
        icon : "fa fa-warning shake animated",
        number : "1",
        timeout : 5000
    });
});