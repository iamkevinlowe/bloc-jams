var createSongRow = function(songNumber, songName, songLength) {
    
    var template = 
        '<tr class="album-view-song-item">' +
        '   <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
        '   <td class="song-item-title">' + songName + '</td>' +
        '   <td class="song-item-duration">' + songLength + '</td>' +
        '</tr>'
    ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        
        var songNumber = parseInt($(this).attr('data-song-number'));
        
        if (currentlyPlayingSongNumber !== null) {
            var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }

        if (currentlyPlayingSongNumber !== songNumber) {
            $(this).html(pauseButtonTemplate);
            currentlyPlayingSongNumber = songNumber;
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            updatePlayerBarSong();
        }

        else if (currentlyPlayingSongNumber === songNumber) {
            $(this).html(playButtonTemplate);
            $('.left-controls .play-pause').html(playerBarPlayButton);
            currentlyPlayingSongNumber = null;
            currentSongFromAlbum = null;
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

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var nextSong = function () {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var nextSongIndex = currentSongIndex + 1;
    
    if (nextSongIndex >= currentAlbum.songs.length) {
            nextSongIndex = 0;
    }
    
    currentlyPlayingSongNumber = nextSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[nextSongIndex];
    
    updatePlayerBarSong();
    
    $('.song-item-number[data-song-number="' + (currentSongIndex + 1) + '"]').html(currentSongIndex + 1);
    $('.song-item-number[data-song-number="' + (nextSongIndex + 1) + '"]').html(pauseButtonTemplate);
};

var previousSong = function () {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var prevSongIndex = currentSongIndex - 1;
    
    if (currentSongIndex <= 0) {
        prevSongIndex = currentAlbum.songs.length - 1;
    }
    
    currentlyPlayingSongNumber = prevSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[prevSongIndex];
    
    updatePlayerBarSong();
    
    $('.song-item-number[data-song-number="' + (currentSongIndex + 1) + '"]').html(currentSongIndex + 1);
    $('.song-item-number[data-song-number="' + (prevSongIndex + 1) + '"]').html(pauseButtonTemplate);
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;

var $previousButton = $('.left-controls .previous');
var $nextButton = $('.left-controls .next');

$(document).ready(function() {
    
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    
});