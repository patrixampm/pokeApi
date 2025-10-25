import { config } from 'dotenv';
import express, { Router } from 'express';
import path from 'path';
import url from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import passportGoogle, { Profile, VerifyCallback } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';

// Load environment variables from backend/.env
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '.env') });

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

// ===== User Storage (In-Memory) =====
interface User {
  id: number;
  googleId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  image: string;
  email: string;
}

let lastId = 1;
const users: User[] = [];

const findUserByGoogleId = (googleId: string): User | undefined => {
  return users.find(user => user.googleId === googleId);
};

const findUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

const addUser = (user: Omit<User, 'id'>): User => {
  const newUser = { ...user, id: lastId++ };
  users.push(newUser);
  return newUser;
};

// ===== Passport Configuration =====
const googleStrategy = passportGoogle.Strategy;

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/api/callback',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      let user = findUserByGoogleId(profile.id);
      
      if (user) {
        done(null, user);
      } else {
        const newUser = addUser({
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          image: profile.photos?.[0]?.value || '',
          email: profile.emails?.[0]?.value || '',
        });
        done(null, newUser);
      }
    }
  )
);

// ===== JWT Configuration =====
const JWT_SECRET = 'MY_SECRET'; // TODO: Move to env variable
const COOKIE_NAME = 'authorization';

interface TokenPayload {
  id: number;
}

const createAccessToken = (userId: number): string => {
  const payload: TokenPayload = { id: userId };
  return jwt.sign(payload, JWT_SECRET);
};

const getTokenPayload = async (token: string): Promise<TokenPayload | null> =>
  new Promise((resolve) => {
    jwt.verify(token, JWT_SECRET, (error, payload) => {
      if (error) {
        resolve(null);
      } else {
        resolve(payload as TokenPayload);
      }
    });
  });

// ===== API Routes =====
const api = Router();

api.get('/', async (req, res) => {
  res.send({ id: '1', name: 'test data' });
});

// Pokemon generation endpoint
api.post('/generate-pokemon', async (req, res) => {
  try {
    const { name, animalTypes, abilities } = req.body;
    
    if (!name || !animalTypes || !abilities) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create prompt for image generation
    const prompt = `A pokemon creature named ${name} that combines ${animalTypes.join(' and ')}, with ${abilities.join(', ')} powers, colorful, digital art, high quality, pokemon style, fantasy art`;
    const negativePrompt = 'ugly, blurry, low quality, distorted, disfigured, bad anatomy';
    
    console.log('Generating image for:', name);
    console.log('Prompt:', prompt);
    
    // Call Stable Diffusion API
    const sdResponse = await fetch('http://stable-diffusion.42malaga.com:7860/sdapi/v1/txt2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: negativePrompt,
        steps: 20,
        width: 512,
        height: 512,
        cfg_scale: 7,
        sampler_name: 'Euler a',
      }),
    });
    
    if (!sdResponse.ok) {
      throw new Error(`Stable Diffusion API error: ${sdResponse.status}`);
    }
    
    const sdData = await sdResponse.json();
    
    // The API returns base64 encoded images
    if (!sdData.images || sdData.images.length === 0) {
      throw new Error('No images generated');
    }
    
    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${sdData.images[0]}`;
    
    res.json({
      success: true,
      imageUrl,
      prompt
    });
  } catch (error) {
    console.error('Error generating pokemon:', error);
    res.status(500).json({ error: 'Failed to generate pokemon image' });
  }
});

api.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

api.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  (req, res) => {
    console.log('Received response from Google');
    console.log(req.user);
    const user = req.user as User;
    const token = createAccessToken(user.id);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false, // TODO: Enable in production
      domain: 'localhost', // Share cookie across ports
    });
    // Redirect to frontend (port 8080)
    res.redirect('http://localhost:8080');
  }
);

api.get('/user-profile', async (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  
  if (!token) {
    return res.status(401).send({ error: 'Not authenticated' });
  }

  const payload = await getTokenPayload(token);
  
  if (!payload) {
    return res.status(401).send({ error: 'Invalid token' });
  }

  const user = findUserById(payload.id);

  if (!user) {
    return res.status(401).send({ error: 'User not found' });
  }

  res.status(200).send(user);
});

// ===== Express App Setup =====
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const staticFilesPath = path.resolve(__dirname, './public');
app.use('/', express.static(staticFilesPath));

app.use('/api', api);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/api`);
});