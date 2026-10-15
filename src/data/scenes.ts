import cinemaImage from '../../images/cinema-room-background.jpg';
import concertImage from '../../images/concert-background.jpg';
import formulaOneImage from '../../images/formula-one-background.jpg';
import livingRoomImage from '../../images/living-room-background.jpg';
import retroComputerImage from '../../images/retro-computer-background.jpg';
import skateparkImage from '../../images/slatepark-background.jpg';
import tennisImage from '../../images/tennis-background.jpg';
import wembleyImage from '../../images/wembley-background.jpg';

export type Point = { x: number; y: number };
export type Scene = {
  id: string;
  name: string;
  image: string | null;
  width: number;
  height: number;
  screen?: [Point, Point, Point, Point];
  credit?: { title: string; photographer: string; url: string };
};

// Each screen corner is a percentage of the image, ordered clockwise from top-left.
export const scenes: Scene[] = [
  { id: 'default', name: 'Default', image: null, width: 16, height: 9 },
  {
    id: 'cinema', name: 'Cinema', image: cinemaImage, width: 6000, height: 4000,
    credit: { title: 'Cinema room', photographer: 'Tima Miroshnichenko', url: 'https://www.pexels.com/photo/a-group-of-people-watching-movie-7991318/' },
    screen: [{ x: .376, y: .198 }, { x: .737, y: .198 }, { x: .737, y: .502 }, { x: .376, y: .502 }],
  },
  {
    id: 'concert', name: 'Concert', image: concertImage, width: 5043, height: 3362,
    credit: { title: 'Concert crowd', photographer: 'George Charry', url: 'https://www.pexels.com/photo/crowd-watching-on-a-live-concert-4218027/' },
    screen: [{ x: .345, y: .206 }, { x: .696, y: .206 }, { x: .696, y: .502 }, { x: .345, y: .502 }],
  },
  {
    id: 'living-room', name: 'Living room', image: livingRoomImage, width: 3840, height: 2160,
    credit: { title: 'Modern living-room', photographer: 'Shaza Jocarlos', url: 'https://www.pexels.com/photo/modern-living-room-with-minimalist-decor-39828921/' },
    screen: [{ x: .392, y: .270 }, { x: .675, y: .270 }, { x: .675, y: .553 }, { x: .392, y: .553 }],
  },
  {
    id: 'formula-one', name: 'Race day', image: formulaOneImage, width: 4992, height: 3263,
    credit: { title: 'Exciting Formula 1 race at Silverstone Circuit', photographer: 'Samuel Phillips', url: 'https://www.pexels.com/photo/exciting-formula-1-race-at-silverstone-circuit-36920243/' },
    screen: [{ x: .255, y: .051 }, { x: .708, y: .051 }, { x: .708, y: .441 }, { x: .255, y: .441 }],
  },
  {
    id: 'retro-computer', name: 'Retro computer', image: retroComputerImage, width: 5734, height: 3823,
    credit: { title: 'Black and white vintage computer', photographer: 'Piotr Baranowski', url: 'https://www.pexels.com/photo/black-and-white-photography-of-a-vintage-computer-22763683/' },
    screen: [{ x: .332, y: .210 }, { x: .760, y: .210 }, { x: .760, y: .571 }, { x: .332, y: .571 }],
  },
  {
    id: 'skatepark', name: 'Skatepark', image: skateparkImage, width: 6000, height: 4000,
    credit: { title: 'Skater at skatepark', photographer: 'Darya Sannikova', url: 'https://www.pexels.com/photo/dramatic-skater-at-urban-skatepark-in-autumn-29798024/' },
    screen: [{ x: .201, y: .079 }, { x: .619, y: .079 }, { x: .619, y: .432 }, { x: .201, y: .432 }],
  },
  {
    id: 'tennis', name: 'Tennis', image: tennisImage, width: 5312, height: 2988,
    credit: { title: 'US Open tennis', photographer: 'Raj Tatavarthy', url: 'https://www.pexels.com/photo/people-sitting-on-bench-watching-tennis-event-on-field-during-daytime-171568/' },
    screen: [{ x: .341, y: .030 }, { x: .694, y: .030 }, { x: .694, y: .383 }, { x: .341, y: .383 }],
  },
  {
    id: 'wembley', name: 'Wembley', image: wembleyImage, width: 4032, height: 3024,
    credit: { title: 'Wembley football stadium', photographer: 'David Pickup', url: 'https://www.pexels.com/photo/wembley-football-stadium-10930708/' },
    screen: [{ x: .531, y: .134 }, { x: .915, y: .134 }, { x: .915, y: .422 }, { x: .531, y: .422 }],
  },
];

export const customScenes = scenes.filter((scene) => scene.id !== 'default');
