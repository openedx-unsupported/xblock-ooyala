function OoyalaPlayerEditBlock(runtime, element) {
    var xmlEditorTextarea = $('.block-xml-editor', element),
        xmlEditor = CodeMirror.fromTextArea(xmlEditorTextarea[0], { mode: 'xml' });

    $(element).find('.save-button').bind('click', function() {
        var data = {
            'display_name': $('.edit-display-name', element).val(),
            'content_id': $('.edit-content-id', element).val(),
            'transcript_file_id': $('.edit-transcript-file-id', element).val(),
            'enable_player_token': $('.edit-enable-player-token', element).val(),
            'partner_code': $('.edit-partner-code', element).val(),
            'api_key': $('.edit-api-key', element).val(),
            'api_secret_key': $('.edit-api-secret-key', element).val(),
            'api_key_3play': $('.edit-api-key-3play', element).val(),
            'player_width': $('.edit-player-width', element).val(),
            'player_height': $('.edit-player-height', element).val(),
            'expiration_time': $('.edit-expiration-time', element).val(),
            'xml_config': xmlEditor.getValue()
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

    $(element).find('.cancel-button').bind('click', function() {
        runtime.notify('cancel', {});
    });
}
