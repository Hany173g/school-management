import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { hash } from 'crypto';
describe('UsersService', () => {
  let service: UsersService;
  let fakeRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
    const fakeJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    fakeRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data as User),
      save: jest.fn((user) => Promise.resolve({ id: 1, ...user } as User)),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { 
          provide: getRepositoryToken(User), 
          useValue: fakeRepo
        }, 
        {
          provide:JwtService,
          useValue:fakeJwtService
        },
        {
          provide:ConfigService,
          useValue: {
            get: jest.fn((key : string) => {
              const config: Record<string, string> = {
                JWT_ACCESS_SECRET: 'test-secret',
              };
              return config[key]
            })
          }
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('test user service ', () => {
     let user = {
          id:1,
          email:"test@gmail.com",
          password:"123456789"
      } as User
    describe('create user service' , () => {
     it('should it throw error beacuse email is used already' , async () => {
        fakeRepo.findOne.mockResolvedValue(user)
        await expect(service.create(user)).rejects.toThrow()
      }) 
      it('should user is create and save and hashPassword' , async () => {
        fakeRepo.create.mockImplementation((data) => data);
        fakeRepo.save.mockImplementation(async (data) => data);
        await service.create(user)
        fakeRepo.findOne.mockResolvedValue(null)
        expect(fakeRepo.create).toHaveBeenCalled()
        expect(fakeRepo.save).toHaveBeenCalled()
        const savedUser = fakeRepo.save.mock.calls[0][0];
        expect(savedUser.password).not.toBe(user.password)
      })
     }) 
     describe('login user service', () => {
        it('should throw error if user not found' , async() => {
          fakeRepo.findOne.mockResolvedValue(null)
          await expect(service.login(user)).rejects.toThrow()
        })
        it('should throw error if password not match', async() => {
           let hashPassword = await bcrypt.hash('this is random password' , 10)
           let password = user.password
           user.password = hashPassword 
           fakeRepo.findOne.mockResolvedValue(user)
           user.password = password
           await expect(service.login(user)).rejects.toThrow()
        })
        it('should success login if valid data' ,async () => {
           let hashPassword = await bcrypt.hash(user.password , 10)
           let password = user.password
           const returnUser = {
            ...user,
            password : hashPassword
           }
           fakeRepo.findOne.mockResolvedValue(returnUser)
            const loginData = {
              email: user.email,
              password,
            };
           await expect(service.login(loginData)).resolves.toEqual(returnUser)
        })
     })
  })
});