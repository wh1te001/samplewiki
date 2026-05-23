-- Seed data: users, artists, albums, tracks, samples
USE `samplewiki`;

-- Insert a seed user
INSERT INTO `Users` (`Username`, `Email`, `PasswordHash`, `Role`, `IsActive`)
VALUES ('seeduser', 'seed@example.com', '$2a$11$K4YfGqJ1e4YHIpRHiFJY0uUq0l0v0z0y0w0x0v0u0t0s0r0q0p0o0n0m0l0', 1, 1);
SET @userId = LAST_INSERT_ID();

-- Insert Daft Punk and albums
INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('Daft Punk', 'French electronic music duo', 'https://en.wikipedia.org/wiki/Daft_Punk');
SET @daftId = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Discovery', 2001, 'Breakthrough album by Daft Punk', @daftId);
SET @daftAlbumDiscovery = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Random Access Memories', 2013, 'Grammy-winning album', @daftId);
SET @daftAlbumRAM = LAST_INSERT_ID();

-- Insert Daft Punk tracks with ResourceUrl
INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES (
  'Harder, Better, Faster, Stronger', 224, 4, 'Electronic',
  'https://www.youtube.com/watch?v=gAjR4_CbPpQ',
  @daftAlbumDiscovery, @daftId, @userId
);
SET @daftTrackHBFS = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES (
  'Digital Love', 300, 5, 'Electronic',
  'https://www.youtube.com/watch?v=NtlT3hMfHXg',
  @daftAlbumDiscovery, @daftId, @userId
);
SET @daftTrackDigitalLove = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES (
  'Get Lucky', 369, 1, 'Funk',
  'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
  @daftAlbumRAM, @daftId, @userId
);
SET @daftTrackGetLucky = LAST_INSERT_ID();

-- Insert Kanye West and albums
INSERT INTO `Artists` (`Name`, `Description`, `WikiLink`) VALUES
('Kanye West', 'American rapper, singer, songwriter and record producer', 'https://en.wikipedia.org/wiki/Kanye_West');
SET @kanyeId = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('Graduation', 2007, 'Third studio album by Kanye West', @kanyeId);
SET @kanyeAlbumGraduation = LAST_INSERT_ID();

INSERT INTO `Albums` (`Title`, `ReleaseYear`, `Description`, `ArtistId`) VALUES
('My Beautiful Dark Twisted Fantasy', 2010, 'Critically acclaimed album', @kanyeId);
SET @kanyeAlbumMBDTF = LAST_INSERT_ID();

-- Insert Kanye tracks with ResourceUrl
INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES (
  'Stronger', 311, 1, 'Hip-Hop',
  'https://www.youtube.com/watch?v=PsO6ZnUZI0g',
  @kanyeAlbumGraduation, @kanyeId, @userId
);
SET @kanyeTrackStronger = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES (
  'Power', 292, 1, 'Hip-Hop',
  'https://www.youtube.com/watch?v=TYo3nzMhgo4',
  @kanyeAlbumMBDTF, @kanyeId, @userId
);
SET @kanyeTrackPower = LAST_INSERT_ID();

INSERT INTO `Tracks` (`Title`, `DurationSeconds`, `TrackNumber`, `Genre`, `ResourceUrl`, `AlbumId`, `ArtistId`, `UserId`)
VALUES (
  'Runaway', 543, 9, 'Hip-Hop',
  'https://www.youtube.com/watch?v=Bm5H7y6R4YI',
  @kanyeAlbumMBDTF, @kanyeId, @userId
);
SET @kanyeTrackRunaway = LAST_INSERT_ID();

-- Insert Samples (descriptive only — resource links on the tracks themselves)
-- Kanye's 'Stronger' samples Daft Punk's 'Harder, Better, Faster, Stronger'
INSERT INTO `Samples` (`Title`, `Type`, `Description`, `TrackId`)
VALUES (
  'Harder, Better, Faster, Stronger (vocal chop)',
  0,
  'Kanye West''s "Stronger" prominently samples the vocal hook from Daft Punk''s "Harder, Better, Faster, Stronger". The iconic "Work it harder, make it better, do it faster, makes us stronger" vocal is used as the central melodic element.',
  @kanyeTrackStronger
);
SET @sample1 = LAST_INSERT_ID();

-- Another sample in Stronger
INSERT INTO `Samples` (`Title`, `Type`, `Description`, `TrackId`)
VALUES (
  'Coltrane "My Favorite Things" (drum break)',
  0,
  'The drum break in "Stronger" is inspired by Elvin Jones'' drumming on John Coltrane''s rendition of "My Favorite Things", though heavily processed.',
  @kanyeTrackStronger
);

-- Sample in Power
INSERT INTO `Samples` (`Title`, `Type`, `Description`, `TrackId`)
VALUES (
  'King Crimson "21st Century Schizoid Man"',
  0,
  'Kanye West''s "Power" samples the iconic guitar riff from King Crimson''s "21st Century Schizoid Man" (1969). The sample runs throughout the track and provides its main instrumental hook.',
  @kanyeTrackPower
);

-- Sample in Runaway
INSERT INTO `Samples` (`Title`, `Type`, `Description`, `TrackId`)
VALUES (
  'Volcano Choir "Still" (vocal loop)',
  1,
  '"Runaway" uses an interpolation of the vocal melody from Volcano Choir''s "Still". The melody is re-sung and processed through auto-tune.',
  @kanyeTrackRunaway
);

-- Sample in Digital Love
INSERT INTO `Samples` (`Title`, `Type`, `Description`, `TrackId`)
VALUES (
  'George Duke "I Love You More"',
  0,
  'Daft Punk''s "Digital Love" samples the piano riff from George Duke''s "I Love You More" (1982). The sample is sped up and looped throughout the track.',
  @daftTrackDigitalLove
);

-- Insert Artwork entries (album covers only)
INSERT INTO `Artworks` (`Title`, `ImageUrl`, `Description`, `AlbumId`) VALUES
('Discovery Cover', 'https://upload.wikimedia.org/wikipedia/en/8/86/DaftPunkDiscovery.jpg', 'Album cover for Discovery by Daft Punk', @daftAlbumDiscovery),
('Random Access Memories Cover', 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg', 'Album cover for Random Access Memories', @daftAlbumRAM),
('Graduation Bear Cover', 'https://upload.wikimedia.org/wikipedia/en/7/70/Kanye_West_-_Graduation.jpg', 'Album cover for Graduation by Kanye West', @kanyeAlbumGraduation),
('MBDTF Cover', 'https://upload.wikimedia.org/wikipedia/en/6/6b/My_Beautiful_Dark_Twisted_Fantasy.jpg', 'Album cover for My Beautiful Dark Twisted Fantasy', @kanyeAlbumMBDTF);

-- Done
SELECT 'Seed data inserted' AS Message;
