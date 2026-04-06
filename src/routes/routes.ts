import { Router } from 'express'
import { ProjectController } from '../controllers/ProjectController'
import { UserController } from '../controllers/UserController'
import { TaskController } from '../controllers/TaskController'
import { AuthController } from '../controllers/AuthController'
import { authMiddleware } from '../middleware/auth'

const authController = new AuthController()

const router = Router()

const projectController = new ProjectController()
const userController = new UserController()
const taskController = new TaskController()

// Autenticação
router.post('/signup', authController.signup)
router.post('/signin', authController.signin)

// Projetos do usuário
router.post('/projects', authMiddleware, projectController.create)
router.get('/projects', authMiddleware, projectController.list)
router.get('/projects/:id', authMiddleware, projectController.getOne) 
router.delete('/projects/:id', authMiddleware, projectController.delete);
router.post('/projects/:projectId/members', authMiddleware, userController.addToProject)
router.delete('/projects/:projectId/members/:userId', authMiddleware, userController.remove)
router.patch('/projects/:projectId/members/:userId', authMiddleware, userController.updateRole)
router.post('/projects/:projectId/tasks', authMiddleware, taskController.create)
router.get('/projects/:projectId/tasks', authMiddleware, taskController.list)

// usuário (unico)
router.get('/me', authMiddleware, userController.getMe);
router.post('/change-password', authMiddleware, userController.changePassword);
router.delete('/me', authMiddleware, userController.deleteAccount);

// usuários (global)
router.get('/users', authMiddleware, userController.list)

export default router