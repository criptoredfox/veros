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