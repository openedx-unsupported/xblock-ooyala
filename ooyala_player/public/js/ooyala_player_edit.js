function OoyalaPlayerEditBlock(runtime, element) {
    $(element).find('.action-save').bind('click', function() {
        var data = {
            'display_name': $('.edit-display-name', element).val(),
            'content_id': $('.edit-content-id', element).val(),
            'transcript_id': $('.edit-transcript-id', element).val()
        };

        $('.xblock-editor-error-message', element).html();
        $('.xblock-editor-error-message', element).css('display', 'none');
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            if (response.result === 'success') {
                window.location.reload(false);
            } else {
                $('.xblock-editor-error-message', element).html('Error: '+response.message);
                $('.xblock-editor-error-message', element).css('display', 'block');
            }
        });
    });
}
