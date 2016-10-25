$(document).ready(function() {
    $(window).on('resize.jqGrid', function() {
        $("#jqgrid").jqGrid('setGridWidth', $("#content").width());
    });

    $.ajax({
        url: "/api/network/statistics",
        type: "GET",
        dataType: 'json',
        success: function(result) {
            console.log(result);
            $('#availableSupply').html(numeral(result.data.availableSupply).format('0,0') + " VEROS");
            $('#totalSupply').html(numeral(result.data.totalSupply).format('0,0') + " VEROS");
        }
    });

    $("#jqgrid").jqGrid({
        url: "/api/network/transactions",
        datatype : "json",
        height : 'auto',
        jsonReader: {
            repeatitems: false,
            id: "Id",
            root: function (obj) {
                return obj.data.transactions;
            },
            page: function (obj) {
                return 1;
            },
            total: function (obj) {
                return 4;
            },
            records: function (obj) {
                return 4;
            }
        },
        colNames : ['index','Sender', 'Recipient', 'Amount', 'Date'],
        colModel : [{
            name : 'index',
            index : 'index',
            hidden: true
        },{
            name : 'Sender',
            index : 'senderAddress',
            formatter: function(value,opt,rowData) {
                return "<a href='/address/" + rowData.senderAddress + "'>" + rowData.senderAddress + "</a>";
            }
        }, {
            name : 'Recipient',
            index : 'recipientAddress',
            editable : true,
            formatter: function(value,opt,rowData) {
                return "<a href='/address/" + rowData.recipientAddress + "'>" + rowData.recipientAddress + "</a>";
            }
        }, {
            name: 'Amount',
            index: 'amount',
            editable: true,
            align: 'center',
            formatter: function(value,opt,rowData) {
                return numeral(rowData.amount).format('0,0') + " VEROS";
            }
        },{
            name: 'Date',
            index: 'datetime',
            editable: true,
            formatter: function(value,opt,rowData) {
                return new Date(rowData.datetime * 1000);
            }
        }],
        onSelectRow: function(){
            var rowId = $("#jqgrid").getGridParam('selrow');
            var data = $('#jqgrid').jqGrid ('getRowData', rowId);
            window.location = "/transaction/" + data.index;
        },
        rowNum : 10,
        rowList : [10, 20, 30],
        pager : '#pjqgrid',
        sortname : 'id',
        viewrecords : true,
        sortorder : "asc",
        caption : "Recent transactions",
        autowidth : true

    });
    jQuery("#jqgrid").jqGrid('navGrid', "#pjqgrid", {
        edit : false,
        add : false,
        del : false
    });
    //jQuery("#jqgrid").jqGrid('inlineNav', "#pjqgrid");
    /* Add tooltips */
});