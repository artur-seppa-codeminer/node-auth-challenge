import { handler } from '../../_lib/http/handler.js';
import { UserModel } from '../../database/models/UsersModel.js';
import bcrypt from 'bcrypt';

interface UserRequest {
    email: string;
    password: string;
}

interface AuthenticationResult {
    success: boolean;
    user?: Partial<UserModel>;
    message?: string;
}

const index = handler(async (request, reply) => {
    return reply.view('login/index', {
        error: null
    });
});

const authenticate = async (email: string, password: string): Promise<AuthenticationResult> => {
    const user = await UserModel.query().findOne({ email });
    if (!user) {
        return {
            success: false,
            message: 'User not found with the provided email'
        };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return {
            success: false,
            message: 'Invalid password'
        };
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
        success: true,
        user: userWithoutPassword
    };
};

const login = handler<{ Body: UserRequest }>(async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
        return reply.view('login/index', {
            error: 'Email and password are required'
        });
    }

    const result = await authenticate(email, password);

    if (!result?.success || !result.user?.id || !result.user?.name) {
        return reply.view('login/index', { error: result?.message });
    }

    const token = request.server.generateToken({ id: result.user.id, email: result.user.name });

    reply.clearCookie('auth_token');

    try {
        reply.setCookie('auth_token', token, {
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600
        });

        return reply.redirect('/users');
    } catch (error) {
        console.error(error)
        return reply.view('login/index', { error: error });
    }

});

const logout = handler(async (request, reply) => {
    reply.clearCookie('auth_token');
    return reply.view('login/index', {
        error: null
    });
});

export { index, authenticate, login, logout };