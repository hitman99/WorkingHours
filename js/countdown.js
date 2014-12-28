/*
 * Author: Hitman_99
 * admin@hitman.lt
 * Licence GPL v3
 */
(function(){
    var texts = {
        'en' : {
            'time_before_cob_message' : 'Time before close of business',
            'time_after_cob_message' : 'Time before work starts',
            'hours' : 'hours',
            'minutes' : 'minutes',
            'seconds' : 'seconds',
            'save' : 'Save',
            'change_hours': 'Change hours',
            'opening_hours_text' : 'Opening hours',
            'closing_hours_text' : 'Closing hours'
        },
        'lt' : {
            'time_before_cob_message' : 'Laikas iki darbo pabaigos',
            'time_after_cob_message' : 'Laikas iki darbo pradžios',
            'hours' : 'valandų',
            'minutes' : 'minučių',
            'seconds' : 'sekundžių',
            'change_hours': 'Pakeisti valandas',
            'opening_hours_text' : 'Darbo pradžia',
            'closing_hours_text' : 'Darbo pabaiga',
            'save' : 'Išsaugoti',
        }
    };
    var status = 'work';
    var title_message = texts['lt'].time_before_cob_message;
    function getParam(key){
        if(typeof(Storage) !== 'undefined'){
            return JSON.parse(localStorage.getItem(key));
        }
        else{
            return null;
        }
    }
    function setParam(key, hours){
        if(typeof(Storage) !== 'undefined'){
            localStorage.setItem(key, JSON.stringify(hours));
            return true;
        }
        else{
            return false;
        }
    }
    function validateTime(time){
        var timeRegex = /^([01]{1}[0-9]{1}|2[0-3]{1})\:[0-5]{1}[0-9]{1}\:[0-5]{1}[0-9]{1}$/;
        if(timeRegex.test(time)){
            return true;
        }
        return false;
    }
    var saveSettings = function(){
        //Validate time
        var time_is_valid = true;
        if(validateTime($('#opening-hours').val())){
            setParam('opening-hours', $('#opening-hours').val());
            $('.two.fields > .field:first').removeClass('error');
        }
        else{
            time_is_valid = false;
            $('.two.fields > .field:first').addClass('error');
        }
        if(validateTime($('#closing-hours').val())){
            setParam('closing-hours', $('#closing-hours').val());
            $('.two.fields > .field:last').removeClass('error');
        }
        else{
            time_is_valid = false;
            $('.two.fields > .field:last').addClass('error');
        }
        if($('#opening-hours').val() == $('#closing-hours').val()){
            time_is_valid = false;
            $('.two.fields > .field').addClass('error');
        }
        if(time_is_valid){
            $('#settings').hide();
            runCountdown();
            $('#timer').show();
            $('.settings-button').show();
        }
    };
    /*********************************** Time functions *********************************************************/
    function countdown(){
        var dateNow = new Date();
        var seconds = dateInTheFuture.getTime() - dateNow.getTime();
        delete dateNow;
        if(seconds < 0){
            recalculateDate();
            translatePage();
            var seconds = dateInTheFuture.getTime() - dateNow.getTime();
        }
        var hours=0, mins=0, secs=0;
        var seconds = Math.floor(seconds/1000);//remove milliseconds just seconds
        hours=Math.floor(seconds/3600);//hours
        seconds=seconds%3600;
        if(parseInt(hours) < 10)
                hours = "0" + hours;

        mins=Math.floor(seconds/60);//minutes
        seconds=seconds%60;
        if(parseInt(mins) < 10)
                mins = "0" + mins;

        secs=Math.floor(seconds);//seconds
        if(parseInt(secs) < 10)
                secs = "0" + secs;

        $("#hrs").text(hours);
        $("#mins").text(mins);
        $("#secs").text(secs);
    }
    function recalculateDate(){
        dateInTheFuture = new Date();
        var dateNow = new Date();
        var openingHours = getParam('opening-hours').split(':');
        var closingHours = getParam('closing-hours').split(':');
        dateInTheFuture.setHours(parseInt(openingHours[0]),parseInt(openingHours[1]),parseInt(openingHours[2]),0);
        // Darbas jau prasidejo
        if((dateInTheFuture.getTime() - dateNow.getTime()) < 0){
            dateInTheFuture.setHours(parseInt(closingHours[0]),parseInt(closingHours[1]),parseInt(closingHours[2]),0);
            // Prasukam 1 diena, jei pabaigos laikas mazesnis uz pradzios
            if(parseInt(openingHours[0]) > parseInt(closingHours[0])){
                dateInTheFuture.setDate(dateInTheFuture.getDate() + 1);
            }
            else{
                if(parseInt(openingHours[0]) == parseInt(closingHours[0]) &&
                   parseInt(openingHours[1]) >  parseInt(closingHours[1])) {
                   dateInTheFuture.setDate(dateInTheFuture.getDate() + 1);
                }
                else{
                    if(parseInt(openingHours[0]) == parseInt(closingHours[0]) &&
                       parseInt(openingHours[1]) ==  parseInt(closingHours[1]) &&
                       parseInt(openingHours[2]) >  parseInt(closingHours[2])) {
                       dateInTheFuture.setDate(dateInTheFuture.getDate() + 1);
                    }
                }
            }
            // Darbas jau baigesi
            if((dateInTheFuture.getTime() - dateNow.getTime()) < 0){
                dateInTheFuture.setHours(parseInt(openingHours[0]),parseInt(openingHours[1]),parseInt(openingHours[2]),0);
                dateInTheFuture.setDate(dateInTheFuture.getDate() + 1);
                title_message = 'time_after_cob_message';
            }
            else{
                title_message = 'time_before_cob_message';
            }
        }
        else{
            title_message = 'time_after_cob_message';
        }
        var currentWeekday = (dateInTheFuture.getDay() == 0 ? 7 : dateInTheFuture.getDay()); // Prakeiktas formatas, kai 0 reiškia sekmadienį :|
        if(currentWeekday >= 5){
            dateInTheFuture.setDate(dateInTheFuture.getDate() + (7 - currentWeekday));
        }
        $('#header').text(t(title_message));
    }

    function runCountdown(){
        clearInterval(timer);
        recalculateDate();
        countdown();
        timer = setInterval(function(){
            countdown();
        }, 1000);
    }
    function t(text_id){
        return texts[lang][text_id];
    }
    function translatePage(){
        $('.hours-text').text(t('hours'));
        $('.minutes-text').text(t('minutes'));
        $('.seconds-text').text(t('seconds'));
        $('#header').text(t(title_message));
        $('.settings-button').text(t('change_hours'));
        $('.save-settings-button').text(t('save'));
        $('#settings').find('.field:first > label').text(t('opening_hours_text'));
        $('#settings').find('.field:last > label').text(t('closing_hours_text'));
    }
    /******************************************** Page Handling ***************************************************/
    var timer = null;
    //Get language
    var lang = getParam('language');
    if(lang === null){
        setParam('language', 'lt');
        lang = 'lt';
    }
    $('.ui.dropdown').dropdown({
        onChange : function(text, value){
            setParam('language', text);
            lang = text;
            translatePage();
        }
    });
    if(getParam('opening-hours') === null || getParam('closing-hours') === null){
        $('.settings-button').hide();
        $('#settings').show();
        $('.save-settings-button').unbind('click').click(saveSettings);
    } else {
        runCountdown();
        $('#timer').show();
        $('.settings-button').show();
    }
    $('.settings-button').click(function(){
        $('#opening-hours').val(getParam('opening-hours'));
        $('#closing-hours').val(getParam('closing-hours'));
        $('.settings-button').hide();
        $('#timer').hide();
        $('#settings').show();
        $('.save-settings-button').unbind('click').click(saveSettings);
    });
    translatePage();
})();