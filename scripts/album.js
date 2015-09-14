var createSongRow = function(songNumber, songName, songLength) {
    
    var template = 
        '<tr class="album-view-song-item">' +
        '   <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
        '   <td class="song-item-title">' + songName + '</td>' +
        '   <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>' +
        '</tr>'
    ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        
        var songNumber = parseInt($(this).attr('data-song-number'));
        updateSeekPercentage($('.volume .seek-bar'), currentVolume / 100);
        
        if (currentlyPlayingSongNumber !== null) {
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }

        if (currentlyPlayingSongNumber !== songNumber) {
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            updatePlayerBarSong();
        }

        else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.left-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $('.left-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }

    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };
    
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    
    return $row;
    
};

var updatePlayerBarSong = function() {
    var songName = currentSongFromAlbum.name;
    var artistName = currentAlbum.artist;
    
    $('.currently-playing .song-name').text(songName);
    $('.currently-playing .artist-name').text(artistName);
    $('.currently-playing .artist-song-mobile').text(songName + ' - ' + artistName);
    
    $('.left-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(currentSongFromAlbum.length);
};

var setCurrentAlbum = function(album) {
    
    currentAlbum = album;
    
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.name);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for (i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
        $albumSongList.append($newRow);
    }
    
};

var updateSeekBarWhileSongPlays = function() {
    
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(this.getTime());
        });
    }
    
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
    
};

var setupSeekBars = function() {
    
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($(this).parent().hasClass('seek-control')) {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else if ($(this).parent().hasClass('volume')) {
            setVolume(seekBarFillRatio * 100);
        }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    
    $seekBars.find('.thumb').mousedown(function(event) {
        
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ($seekBar.hasClass('seek-control')) {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else if ($(this).parent().hasClass('volume')) {
                setVolume(seekBarFillRatio * 100);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
        
    });
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var nextSong = function () {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var nextSongIndex = currentSongIndex + 1;
    
    if (nextSongIndex >= currentAlbum.songs.length) {
            nextSongIndex = 0;
    }
    
    setSong(nextSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    
    getSongNumberCell(currentSongIndex + 1).html(currentSongIndex + 1);
    getSongNumberCell(nextSongIndex + 1).html(pauseButtonTemplate);
};

var previousSong = function () {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var prevSongIndex = currentSongIndex - 1;
    
    if (currentSongIndex <= 0) {
        prevSongIndex = currentAlbum.songs.length - 1;
    }
    
    setSong(prevSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    
    getSongNumberCell(currentSongIndex + 1).html(currentSongIndex + 1);
    getSongNumberCell(prevSongIndex + 1).html(pauseButtonTemplate);
};

var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = songNumber;
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: [ 'mp3' ],
        preload: true
    });
    
    setVolume(currentVolume);
};

var seek = function(time) {
    
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
    
};

var setVolume = function(volume) {
    currentVolume = volume;
    
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var setCurrentTimeInPlayerBar = function(currentTime) {
    $('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
    $('.total-time').text(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds) {
    if (typeof timeInSeconds === 'number') {
        var totalSeconds = parseFloat(timeInSeconds);
        var minutes = Math.floor(totalSeconds / 60) + "";
        var seconds = Math.floor(totalSeconds % 60) + "";

        if (seconds.length <= 1) {
            seconds = "0" + seconds;
        }
        
        return (minutes + ":" + seconds);
    } else {
        return timeInSeconds;
    }  
};

var togglePlayFromPlayerBar = function() {
    if (currentSoundFile) {
        if (currentSoundFile.isPaused()) {
            getSongNumberCell(currentlyPlayingSongNumber).html(pauseButtonTemplate);
            $(this).html(playerBarPauseButton);
            currentSoundFile.play();
        } else {
            getSongNumberCell(currentlyPlayingSongNumber).html(playButtonTemplate);
            $(this).html(playerBarPlayButton);
            currentSoundFile.pause();
        }
    } else {
        setSong(1);
        updatePlayerBarSong();
        getSongNumberCell(1).html(pauseButtonTemplate);
        $(this).html(playerBarPauseButton);
        currentSoundFile.play();
    }
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.left-controls .previous');
var $nextButton = $('.left-controls .next');
var $playPauseButton = $('.left-controls .play-pause');

$(document).ready(function() {
    
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);
    
});