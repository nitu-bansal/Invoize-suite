angularApp.directive('w2layout', function($compile, $parse) {
    return {
        restrict: 'A',
        compile: function () {
            $("#layout").w2destroy("layout");
            var pstyle = 'border: 1px solid #dfdfdf; padding: 5px; z-index:0;';
            $('#layout').w2layout({
                name: 'layout',
                padding: 4,
                panels: [
                    { type: 'main', size: '50%', resizable: true, style: pstyle, content: '' },
                    { type: 'right', size: '50%',hidden: true, resizable: true, style: pstyle, content: '' }]
            });

            w2ui['layout'].content('main', '<div ng-show="!templateLoader" ui-handsontable="{ currentRowClassName: &quot;currentRow&quot;,currentColClassName: &quot;currentCol&quot;}" afterCreateRow="onRowCreate" rowHeaders="rowNos" height="hh" width="hw" datarows="shipment in shipments" manualColumnResize="true" columns="columns" minsparerows="1" onBeforeChange="celChange" afterRender="afterRender()"></div>' +
                ' <pagination ng-show="showGrid &amp;&amp; !templateLoader" total-items="totalItems" items-per-page="pageLimit" page="currentPage" on-select-page="setPage($parent.currentPage)" boundary-links="true" class="pagination-small"></pagination>');


            $('.loadUI').click(function(){
                w2ui['layout'].toggle('right', window.instant);
                w2ui['layout'].content('right', '<div class="pull-right doc-box">' +
                                                '   <select placeholder="Select Document" class="inz-txt" style="height: 26px; width: auto; min-width: 100px;">' +
                                                '       <option value="one">First</option>' +
                                                '       <option value="two">Second</option>' +
                                                '       <option value="three">Third</option>' +
                                                '   </select>' +
                                                '</div>' +
//                                                '<iframe src="http://docs.google.com/gview?url=http://infolab.stanford.edu/pub/papers/google.pdf&embedded=true" style="width:100%; height:100%;" frameborder="0"></iframe>');
                                                '<iframe src="http://docs.google.com/gview?url=http://searce2.dev.invoize.info/api/tms/download/file?id=536b56487fa6424eb99808d9&size=0&embedded=true" style="width:100%; height:100%;" frameborder="0"></iframe>');
                setTimeout(function(){
                    if($('#layout_layout_panel_right').is(':visible'))
                        $('.loadUI').children('.fa').removeClass('fa-columns').addClass('fa-table');
                    else
                        $('.loadUI').children('.fa').removeClass('fa-table').addClass('fa-columns');
    //for document frame dragging
                    $('body').on('mousedown','#layout_layout_resizer_right',function(){
                        $("iframe").hide();
                    }).on('mouseup','#layout_layout_resizer_right',function(){
                        $("iframe").show();
                       $(this).scope().RenderHTW();
                    });

                },100);
            });

            setTimeout(function(){
                $('.w2ui-panel').parent().css('z-index','0');
            },2000);

        }
    }
});



